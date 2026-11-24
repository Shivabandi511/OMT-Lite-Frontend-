import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import yardService from '../services/yardService';
import type { Vehicle, Yard, VehicleStatus, RoutingDecision, Part } from '../types';
import { useAuth } from '../context/AuthContext';
import { OmtLogoLoader } from '../components/common/OmtLogoLoader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { InfoModal } from '../components/common/InfoModal';
import {
  Car,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Edit2,
  X,
  AlertCircle,
  ChevronDown,
  Search,
  QrCode,
  Tag,
  Plus,
  Check,
  MapPin,
  FileText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canMakeOperations } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [yards, setYards] = useState<Yard[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [allVehicleList, setAllVehicleList] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination state for parts
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Vehicle Edit modal/form state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancingStatus, setIsAdvancingStatus] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    manufactureYear: 2020,
    yardId: '',
    routingDecision: 'DISMANTLE' as RoutingDecision,
    notes: '',
  });

  // Add Part modal state
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState('BODY PANELS');
  const [newPartCanExtract, setNewPartCanExtract] = useState(true);

  // Parts filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [extractionFilter, setExtractionFilter] = useState<'ALL' | 'CAN_EXTRACT' | 'CANNOT_EXTRACT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedPartIds, setSelectedPartIds] = useState<number[]>([]);

  // Active open dropdown for extraction status & lifecycle status
  const [openDropdownPartId, setOpenDropdownPartId] = useState<number | null>(null);
  const [openStatusDropdownPartId, setOpenStatusDropdownPartId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Application-level confirmation modal state (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    targetStatus: VehicleStatus | null;
    title: string;
    message: React.ReactNode;
    variant: 'primary' | 'warning' | 'danger';
    confirmText: string;
  }>({
    isOpen: false,
    targetStatus: null,
    title: '',
    message: null,
    variant: 'primary',
    confirmText: 'Advance Status',
  });

  // Application-level Info modal state (replaces native window.alert)
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    content: null,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownPartId(null);
        setOpenStatusDropdownPartId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);

      const [vData, yData, pData, allVehicles] = await Promise.all([
        vehicleService.getVehicleById(id),
        yardService.getYards(),
        vehicleService.getParts(id),
        vehicleService.getVehicles(),
      ]);

      setVehicle(vData);
      setYards(yData);
      setParts(pData);
      setAllVehicleList(allVehicles);

      setFormData({
        make: vData.make,
        model: vData.model,
        manufactureYear: vData.manufactureYear,
        yardId: String(vData.yardId),
        routingDecision: vData.routingDecision,
        notes: vData.notes || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vehicle asset details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle extraction update (Can Be Extracted / Cannot Be Extracted)
  const handleToggleExtraction = async (partId: number, canBeExtracted: boolean) => {
    if (!id) return;

    // Optimistic UI update
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, canBeExtracted } : p))
    );
    setOpenDropdownPartId(null);

    try {
      await vehicleService.updatePartExtraction(id, partId, canBeExtracted);
      setSuccessMsg(
        `Part extraction capability updated to: ${canBeExtracted ? 'Can Be Extracted' : 'Cannot Be Extracted'}`
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      // Revert if API call fails
      setParts((prev) =>
        prev.map((p) => (p.id === partId ? { ...p, canBeExtracted: !canBeExtracted } : p))
      );
      setError(err.response?.data?.message || 'Failed to update extraction status.');
    }
  };

  // Handle part lifecycle status update (PENDING, EXTRACTED, MISSING, DAMAGED)
  const handleUpdatePartStatus = async (partId: number, newStatus: string) => {
    if (!id) return;

    // Optimistic UI update
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, status: newStatus } : p))
    );
    setOpenStatusDropdownPartId(null);

    try {
      await vehicleService.updatePartStatus(id, partId, newStatus);
      setSuccessMsg(`Part marked as: ${newStatus === 'EXTRACTED' ? 'Extracted' : newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      fetchData();
      setError(err.response?.data?.message || 'Failed to update part status.');
    }
  };

  // Handle bulk status update
  const handleBulkUpdateStatus = async (targetStatus: string) => {
    if (!id || selectedPartIds.length === 0) return;

    const idsToUpdate = [...selectedPartIds];
    setParts((prev) =>
      prev.map((p) => (idsToUpdate.includes(p.id) ? { ...p, status: targetStatus } : p))
    );
    setSelectedPartIds([]);

    try {
      await Promise.all(
        idsToUpdate.map((pid) => vehicleService.updatePartStatus(id, pid, targetStatus))
      );
      setSuccessMsg(
        `Successfully marked ${idsToUpdate.length} part(s) as ${targetStatus === 'EXTRACTED' ? 'Extracted' : targetStatus}.`
      );
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      fetchData();
      setError(err.response?.data?.message || 'Failed to update selected parts in bulk.');
    }
  };

  // Add Part handler
  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const newPart: Part = {
      id: Date.now(),
      partCode: `${vehicle?.assetCode || 'AST'}-${(parts.length + 1).toString().padStart(3, '0')}`,
      name: newPartName.trim(),
      category: newPartCategory,
      canBeExtracted: newPartCanExtract,
      status: 'PENDING',
      vehicleId: Number(id),
      createdAt: new Date().toISOString(),
    };

    setParts((prev) => [newPart, ...prev]);
    setNewPartName('');
    setShowAddPartModal(false);
    setSuccessMsg(`Part "${newPart.name}" successfully added to inventory.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Vehicle Update handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !id) return;

    if (vehicle.status === 'COMPLETED') {
      setError('Completed vehicles are read-only and cannot be modified.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        manufactureYear: Number(formData.manufactureYear),
        yardId: Number(formData.yardId),
        routingDecision: formData.routingDecision,
        notes: formData.notes.trim() || undefined,
      };

      const updated = await vehicleService.updateVehicle(id, payload);
      setVehicle(updated);
      setIsEditing(false);
      setSuccessMsg('Vehicle asset information successfully updated.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update vehicle asset');
    } finally {
      setIsSaving(false);
    }
  };

  // Status Advance Handler - Opens application confirmation modal
  const handleAdvanceStatus = (targetStatus: VehicleStatus) => {
    if (!vehicle || !id) return;

    const isCompleting = targetStatus === 'COMPLETED';
    setConfirmModal({
      isOpen: true,
      targetStatus,
      title: isCompleting ? 'Complete Vehicle Dismantling' : 'Advance Vehicle Status',
      variant: isCompleting ? 'warning' : 'primary',
      confirmText: isCompleting ? 'Complete & Lock Vehicle' : `Advance to ${targetStatus.replace('_', ' ')}`,
      message: (
        <div>
          <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>
            {isCompleting ? (
              <>
                Completing this vehicle will mark it as <strong>READ-ONLY</strong>. All dismantling operations will be finalized and locked from further changes. Finish dismantling?
              </>
            ) : (
              <>
                Advance vehicle workflow status from{' '}
                <strong style={{ color: '#7c3aed' }}>{vehicle.status}</strong> to{' '}
                <strong style={{ color: '#2563eb' }}>{targetStatus}</strong>?
              </>
            )}
          </p>
          <div
            style={{
              fontSize: 12,
              color: '#4b5563',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              paddingTop: 8,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <span>Asset: <strong>{vehicle.assetCode}</strong></span>
            <span>VIN: <strong>{vehicle.vin}</strong></span>
            <span>Make/Model: <strong>{vehicle.make} {vehicle.model}</strong></span>
          </div>
        </div>
      ),
    });
  };

  // Execution handler called when user clicks confirm in the modal
  const handleConfirmAdvanceStatus = async () => {
    if (!vehicle || !id || !confirmModal.targetStatus) return;

    const targetStatus = confirmModal.targetStatus;
    try {
      setIsAdvancingStatus(true);
      setError(null);
      setSuccessMsg(null);

      const updated = await vehicleService.advanceVehicleStatus(id, targetStatus);
      setVehicle(updated);
      setSuccessMsg(`Vehicle status progressed to ${targetStatus}.`);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to advance status');
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } finally {
      setIsAdvancingStatus(false);
    }
  };

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = p.partCode.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat) return false;
      }
      // Extraction filter
      if (extractionFilter === 'CAN_EXTRACT' && !p.canBeExtracted) return false;
      if (extractionFilter === 'CANNOT_EXTRACT' && p.canBeExtracted) return false;
      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      // Category filter
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;

      return true;
    });
  }, [parts, searchQuery, extractionFilter, statusFilter, categoryFilter]);

  // Previous / Next Vehicle navigation
  const { prevVehicle, nextVehicle } = useMemo(() => {
    if (!allVehicleList || allVehicleList.length === 0 || !id) {
      return { prevVehicle: null, nextVehicle: null };
    }
    const currentIndex = allVehicleList.findIndex((v) => String(v.id) === String(id));
    if (currentIndex === -1) return { prevVehicle: null, nextVehicle: null };
    return {
      prevVehicle: currentIndex > 0 ? allVehicleList[currentIndex - 1] : null,
      nextVehicle: currentIndex < allVehicleList.length - 1 ? allVehicleList[currentIndex + 1] : null,
    };
  }, [allVehicleList, id]);

  // Reset parts pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, extractionFilter, statusFilter, categoryFilter]);

  // Paginated parts
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParts.slice(start, start + pageSize);
  }, [filteredParts, currentPage, pageSize]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = parts.length;
    const pending = parts.filter((p) => p.status === 'PENDING').length;
    const extracted = parts.filter((p) => p.status === 'EXTRACTED').length;
    const missing = parts.filter((p) => p.status === 'MISSING').length;
    const damaged = parts.filter((p) => p.status === 'DAMAGED').length;
    const sold = parts.filter((p) => p.status === 'SOLD').length;

    const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
    const extractedPct = total > 0 ? Math.round((extracted / total) * 100) : 0;
    const missingPct = total > 0 ? Math.round((missing / total) * 100) : 0;

    return { total, pending, extracted, missing, damaged, sold, pendingPct, extractedPct, missingPct };
  }, [parts]);

  // Part Selection toggles
  const handleToggleSelectAll = () => {
    if (selectedPartIds.length === filteredParts.length) {
      setSelectedPartIds([]);
    } else {
      setSelectedPartIds(filteredParts.map((p) => p.id));
    }
  };

  const handleToggleSelectPart = (partId: number) => {
    setSelectedPartIds((prev) =>
      prev.includes(partId) ? prev.filter((i) => i !== partId) : [...prev, partId]
    );
  };

  if (isLoading) {
    return <OmtLogoLoader text="Loading vehicle asset specifications & parts catalog..." />;
  }

  if (!vehicle) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <Car size={48} color="#8e8d9c" style={{ margin: '0 auto 16px' }} />
        <h2>Vehicle Asset Not Found</h2>
        <p style={{ color: '#8e8d9c', marginBottom: 20 }}>The requested vehicle could not be loaded.</p>
        <Link to="/vehicles" className="btn-primary">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto' }}>
      {/* Top Breadcrumb & Navigation Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Back to Vehicles Button */}
          <Link
            to="/vehicles"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: 'var(--omt-color-surface, #ffffff)',
              border: '1px solid var(--omt-color-border, #e5e7eb)',
              color: 'var(--omt-color-text-main, #374151)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Vehicles</span>
          </Link>

          {/* Breadcrumb path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
            <Link
              to="/vehicles"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--omt-color-primary, #8633f3)',
                textDecoration: 'none',
                letterSpacing: '0.04em',
              }}
            >
              <span>VEHICLES</span>
            </Link>
            <span style={{ color: '#c4b5fd' }}>&gt;</span>
            <span style={{ color: '#6b7280' }}>{vehicle.assetCode}</span>
          </div>
        </div>

        {/* Right side: Prev/Next Asset navigation & Read-Only badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {prevVehicle && (
            <button
              onClick={() => navigate(`/vehicles/${prevVehicle.id}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid var(--omt-color-border, #e5e7eb)',
                backgroundColor: 'var(--omt-color-surface, #ffffff)',
                color: 'var(--omt-color-text-main, #374151)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title={`Go to previous vehicle: ${prevVehicle.assetCode}`}
            >
              <ChevronLeft size={14} />
              <span>Prev ({prevVehicle.assetCode})</span>
            </button>
          )}

          {nextVehicle && (
            <button
              onClick={() => navigate(`/vehicles/${nextVehicle.id}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid var(--omt-color-border, #e5e7eb)',
                backgroundColor: 'var(--omt-color-surface, #ffffff)',
                color: 'var(--omt-color-text-main, #374151)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title={`Go to next vehicle: ${nextVehicle.assetCode}`}
            >
              <span>Next ({nextVehicle.assetCode})</span>
              <ChevronRight size={14} />
            </button>
          )}

          {vehicle.readOnly && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid #a7f3d0',
              }}
            >
              <Lock size={12} />
              <span>Read-Only Completed Asset</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Vehicle Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--omt-font-display)',
              fontSize: 26,
              fontWeight: 800,
              color: '#1e1b4b',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {vehicle.make} {vehicle.model} {vehicle.manufactureYear}
          </h1>

          {/* Asset ID Pill */}
          <span
            style={{
              fontFamily: 'var(--omt-font-mono)',
              fontSize: 13,
              fontWeight: 700,
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: 6,
            }}
          >
            {vehicle.assetCode}
          </span>

          {/* Workflow Status Badge */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 16,
              backgroundColor:
                vehicle.status === 'COMPLETED'
                  ? '#ecfdf5'
                  : vehicle.status === 'IN_PROGRESS'
                  ? '#fef3c7'
                  : '#eff6ff',
              color:
                vehicle.status === 'COMPLETED'
                  ? '#065f46'
                  : vehicle.status === 'IN_PROGRESS'
                  ? '#b45309'
                  : '#1d4ed8',
              border: `1px solid ${
                vehicle.status === 'COMPLETED'
                  ? '#a7f3d0'
                  : vehicle.status === 'IN_PROGRESS'
                  ? '#fde68a'
                  : '#bfdbfe'
              }`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor:
                  vehicle.status === 'COMPLETED'
                    ? '#10b981'
                    : vehicle.status === 'IN_PROGRESS'
                    ? '#f59e0b'
                    : '#3b82f6',
              }}
            />
            {vehicle.status === 'IN_PROGRESS'
              ? 'Dismantling In Progress'
              : vehicle.status === 'RECEIVED'
              ? 'Ready for Dismantle'
              : 'Dismantled (Completed)'}
          </span>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!vehicle.readOnly && canMakeOperations && vehicle.status === 'RECEIVED' && (
            <button
              onClick={() => handleAdvanceStatus('IN_PROGRESS')}
              disabled={isAdvancingStatus}
              className="btn-secondary"
              style={{ fontSize: 13, borderColor: '#f59e0b', color: '#b45309' }}
            >
              <Clock size={14} />
              <span>Start Dismantling</span>
            </button>
          )}

          {!vehicle.readOnly && canMakeOperations && vehicle.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleAdvanceStatus('COMPLETED')}
              disabled={isAdvancingStatus}
              className="btn-secondary"
              style={{ fontSize: 13, borderColor: '#10b981', color: '#047857' }}
            >
              <CheckCircle2 size={14} />
              <span>Complete Dismantling</span>
            </button>
          )}

          <button
            onClick={() => setShowAddPartModal(true)}
            style={{
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add Part</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {successMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 18px',
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3 Summary Cards Row (matching Screenshot 1) */}
      <div className="vehicle-summary-grid">
        {/* Card 1: Vehicle Specifications */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #ebe8f3',
            padding: '18px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* VIN */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              VIN
            </span>
            <div style={{ fontFamily: 'var(--omt-font-mono)', fontSize: 14, fontWeight: 800, color: '#1f2937', marginTop: 2 }}>
              {vehicle.vin}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="vehicle-specs-grid">
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>SOURCE</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>IAAI Auto Salvage</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>ACQUIRED</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>
                {new Date(vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>ROUTING DECISION</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>
                {vehicle.routingDecision === 'DISMANTLE' ? 'Dismantle for Parts' : 'Sell as Whole Car'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>STOCK NUMBER</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>{vehicle.assetCode.replace('AST-', '4821')}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>ENGINE CODE</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>K24 Engine</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>YARD</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginTop: 1 }}>{vehicle.yardName}</div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>SALE PRICE</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>NA</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>PRIMARY DAMAGE</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>Salvage Inventory</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>DISMANTLER</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginTop: 1 }}>Staff Yard Team</div>
            </div>
          </div>
        </div>

        {/* Card 2: PARTS BREAKDOWN */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #ebe8f3',
            padding: '18px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
              PARTS BREAKDOWN
            </div>

            {/* Pending Progress */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                <span>Pending</span>
                <span>{metrics.pendingPct}%</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${metrics.pendingPct}%`, height: '100%', backgroundColor: '#475569' }} />
              </div>
            </div>

            {/* Extracted Progress */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  Extracted
                </span>
                <span>{metrics.extractedPct}%</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${metrics.extractedPct}%`, height: '100%', backgroundColor: '#2563eb' }} />
              </div>
            </div>

            {/* Missing Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  Missing
                </span>
                <span>{metrics.missingPct}%</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${metrics.missingPct}%`, height: '100%', backgroundColor: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: QUICK ACTIONS */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #ebe8f3',
            padding: '18px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              QUICK ACTIONS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => setIsEditing(true)}
                disabled={vehicle.readOnly}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: vehicle.readOnly ? '#9ca3af' : '#374151',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: vehicle.readOnly ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                }}
              >
                <Edit2 size={13} color="#7c3aed" />
                <span>Edit Vehicle</span>
              </button>

              <button
                onClick={() => {
                  setInfoModal({
                    isOpen: true,
                    title: 'Yard & Technician Assignment',
                    subtitle: `Asset ${vehicle.assetCode}`,
                    content: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Assigned Storage Yard</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 2 }}>{vehicle.yardName}</div>
                        </div>
                        <div style={{ padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Assigned Technician / Team</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 2 }}>{(vehicle as any).dismantler || 'Staff Yard Team'}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                          To reassign this vehicle to another facility or update technician credentials, use <strong>Edit Vehicle</strong> above.
                        </div>
                      </div>
                    ),
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <MapPin size={13} color="#7c3aed" />
                <span>Reassign Yard / Add Technician</span>
              </button>

              <button
                onClick={() => {
                  setInfoModal({
                    isOpen: true,
                    title: 'Vehicle Asset QR Code',
                    subtitle: `${vehicle.make} ${vehicle.model} (${vehicle.manufactureYear})`,
                    content: (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            padding: 20,
                            backgroundColor: '#faf8fe',
                            borderRadius: 16,
                            border: '2px dashed #c4b5fd',
                            marginBottom: 14,
                          }}
                        >
                          <QrCode size={110} color="#7c3aed" />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '0.04em' }}>
                          {vehicle.assetCode}
                        </div>
                        <div style={{ fontSize: 13, fontFamily: 'var(--omt-font-mono, monospace)', color: '#4b5563', marginTop: 4 }}>
                          VIN: {vehicle.vin}
                        </div>
                        <div style={{ fontSize: 12, color: '#8e8d9c', marginTop: 8 }}>
                          Scan in the yard to log parts or inspect intake documentation
                        </div>
                      </div>
                    ),
                  });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <QrCode size={13} color="#7c3aed" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <FileText size={14} />
              <span>Parts Manifest &bull; EN</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters Row (matching Screenshot 1) */}
      <div className="vehicle-kpi-grid">
        {[
          { label: 'TOTAL PARTS', val: metrics.total, color: '#7c3aed', icon: Car },
          { label: 'PENDING', val: metrics.pending, color: '#4b5563', icon: Clock },
          { label: 'EXTRACTED', val: metrics.extracted, color: '#2563eb', icon: CheckCircle2 },
          { label: 'SOLD', val: metrics.sold, color: '#059669', icon: Tag },
          { label: 'MISSING', val: metrics.missing, color: '#ef4444', icon: AlertCircle },
          { label: 'DAMAGED', val: metrics.damaged, color: '#d97706', icon: AlertTriangle },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 10,
              border: '1px solid #ebe8f3',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>
                {k.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1f2937', marginTop: 2 }}>
                {k.val}
              </div>
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${k.color}15`,
                color: k.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <k.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Parts Inventory Toolbar */}
      <div className="vehicle-parts-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1f2937', margin: 0 }}>Parts Inventory</h2>

          {/* Select all checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#4b5563', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filteredParts.length > 0 && selectedPartIds.length === filteredParts.length}
              onChange={handleToggleSelectAll}
              style={{ borderRadius: 4, cursor: 'pointer' }}
            />
            <span>All ({selectedPartIds.length} selected)</span>
          </label>

          {/* Bulk Extraction & Status Trigger */}
          {selectedPartIds.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleBulkUpdateStatus('EXTRACTED')}
                style={{
                  fontSize: 11,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #bfdbfe',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Mark all selected parts as Extracted"
              >
                <CheckCircle2 size={13} />
                <span>Mark as Extracted ({selectedPartIds.length})</span>
              </button>

              <button
                onClick={() => handleBulkUpdateStatus('PENDING')}
                style={{
                  fontSize: 11,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  color: '#4b5563',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Revert selected parts to Pending"
              >
                Mark as Pending
              </button>

              <button
                onClick={() => {
                  selectedPartIds.forEach((pid) => handleToggleExtraction(pid, true));
                  setSelectedPartIds([]);
                }}
                style={{
                  fontSize: 11,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #a7f3d0',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Can Extract
              </button>

              <button
                onClick={() => {
                  selectedPartIds.forEach((pid) => handleToggleExtraction(pid, false));
                  setSelectedPartIds([]);
                }}
                style={{
                  fontSize: 11,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  color: '#991b1b',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cannot Extract
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="vehicle-parts-filters" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="vehicle-parts-search">
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts by name..."
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                outline: 'none',
              }}
            />
          </div>

          {/* Extraction Filter */}
          <select
            value={extractionFilter}
            onChange={(e) => setExtractionFilter(e.target.value as any)}
            style={{
              padding: '7px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Extraction</option>
            <option value="CAN_EXTRACT">Can Be Extracted</option>
            <option value="CANNOT_EXTRACT">Cannot Be Extracted</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="EXTRACTED">Extracted</option>
            <option value="MISSING">Missing</option>
            <option value="DAMAGED">Damaged</option>
            <option value="SOLD">Sold</option>
          </select>

          {/* Group Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Groups</option>
            <option value="BODY PANELS">Body Panels</option>
            <option value="ENGINE">Engine</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="BRAKES">Brakes</option>
            <option value="SUSPENSION">Suspension</option>
            <option value="INTERIOR">Interior</option>
          </select>

          {(searchQuery || extractionFilter !== 'ALL' || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setExtractionFilter('ALL');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: 11 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Parts Grid (Card Layout matching Screenshot 1 & 4) */}
      <div
        ref={dropdownRef}
        className="vehicle-parts-grid"
      >
        {filteredParts.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '48px 20px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #ebe8f3',
              color: '#6b7280',
            }}
          >
            <Car size={36} color="#9ca3af" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: 0 }}>No parts found</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              Try adjusting your search query or filter options.
            </p>
          </div>
        ) : (
          paginatedParts.map((part) => {
            const isDropdownOpen = openDropdownPartId === part.id;
            const isStatusDropdownOpen = openStatusDropdownPartId === part.id;
            const isSelected = selectedPartIds.includes(part.id);

            return (
              <div
                key={part.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  border: isDropdownOpen ? '1.5px solid #7c3aed' : isSelected ? '1.5px solid #a78bfa' : '1px solid #ebe8f3',
                  padding: '16px 18px',
                  boxShadow: isDropdownOpen
                    ? '0 6px 18px rgba(124, 58, 237, 0.12)'
                    : '0 1px 3px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 140,
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Top Row: Category Tag and Checkbox */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#6d28d9',
                        backgroundColor: '#ede9fe',
                        padding: '2px 8px',
                        borderRadius: 4,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {part.category}
                    </span>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectPart(part.id)}
                      style={{ cursor: 'pointer', borderRadius: 4 }}
                    />
                  </div>

                  {/* Part Name */}
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#111827',
                      margin: '0 0 2px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {part.name}
                  </h3>

                  {/* Part Code */}
                  <div
                    style={{
                      fontFamily: 'var(--omt-font-mono)',
                      fontSize: 11,
                      color: '#9ca3af',
                      fontWeight: 600,
                    }}
                  >
                    {part.partCode}
                  </div>
                </div>

                {/* Bottom Row: Extraction Toggle & Status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 14,
                    paddingTop: 10,
                    borderTop: '1px solid #f3f4f6',
                  }}
                >
                  {/* Interactive Extraction Status Button */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setOpenDropdownPartId(isDropdownOpen ? null : part.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: part.canBeExtracted ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        backgroundColor: part.canBeExtracted ? '#f0fdf4' : '#fef2f2',
                        color: part.canBeExtracted ? '#15803d' : '#b91c1c',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                      title="Click to change extraction status"
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: part.canBeExtracted ? '#16a34a' : '#dc2626',
                        }}
                      />
                      <span>{part.canBeExtracted ? 'Can Be Extracted' : 'Cannot Be Extracted'}</span>
                      <ChevronDown size={11} />
                    </button>

                    {/* Extraction Dropdown Menu matching Screenshot 4 */}
                    {isDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          marginBottom: 6,
                          backgroundColor: '#ffffff',
                          borderRadius: 8,
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                          zIndex: 50,
                          minWidth: 170,
                          overflow: 'hidden',
                          animation: 'fadeIn 0.15s ease',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleExtraction(part.id, true)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            border: 'none',
                            background: part.canBeExtracted ? '#f0fdf4' : 'transparent',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#15803d',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                          <span>Can Be Extracted</span>
                          {part.canBeExtracted && <Check size={13} style={{ marginLeft: 'auto' }} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleExtraction(part.id, false)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            border: 'none',
                            background: !part.canBeExtracted ? '#fef2f2' : 'transparent',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#b91c1c',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderTop: '1px solid #f3f4f6',
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }} />
                          <span>Cannot Be Extracted</span>
                          {!part.canBeExtracted && <Check size={13} style={{ marginLeft: 'auto' }} />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Status Badge & Icons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Interactive Lifecycle Status Dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setOpenStatusDropdownPartId(isStatusDropdownOpen ? null : part.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 6,
                          border:
                            part.status === 'EXTRACTED'
                              ? '1px solid #bfdbfe'
                              : part.status === 'MISSING'
                              ? '1px solid #fecaca'
                              : part.status === 'DAMAGED'
                              ? '1px solid #fed7aa'
                              : '1px solid #e5e7eb',
                          backgroundColor:
                            part.status === 'EXTRACTED'
                              ? '#eff6ff'
                              : part.status === 'MISSING'
                              ? '#fef2f2'
                              : part.status === 'DAMAGED'
                              ? '#fff7ed'
                              : '#f9fafb',
                          color:
                            part.status === 'EXTRACTED'
                              ? '#1d4ed8'
                              : part.status === 'MISSING'
                              ? '#dc2626'
                              : part.status === 'DAMAGED'
                              ? '#c2410c'
                              : '#4b5563',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                        title="Click to update lifecycle status"
                      >
                        <span>
                          {part.status === 'EXTRACTED'
                            ? 'Extracted'
                            : part.status === 'MISSING'
                            ? 'Missing'
                            : part.status === 'DAMAGED'
                            ? 'Damaged'
                            : 'Pending'}
                        </span>
                        <ChevronDown size={11} />
                      </button>

                      {isStatusDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: 6,
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                            zIndex: 50,
                            minWidth: 130,
                            overflow: 'hidden',
                            animation: 'fadeIn 0.15s ease',
                          }}
                        >
                          {[
                            { status: 'EXTRACTED', label: 'Extracted', color: '#1d4ed8' },
                            { status: 'PENDING', label: 'Pending', color: '#4b5563' },
                            { status: 'MISSING', label: 'Missing', color: '#dc2626' },
                            { status: 'DAMAGED', label: 'Damaged', color: '#c2410c' },
                          ].map((opt) => (
                            <button
                              key={opt.status}
                              type="button"
                              onClick={() => handleUpdatePartStatus(part.id, opt.status)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                border: 'none',
                                background: part.status === opt.status ? '#f5f3ff' : 'transparent',
                                fontSize: 12,
                                fontWeight: 700,
                                color: opt.color,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <span>{opt.label}</span>
                              {part.status === opt.status && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newName = prompt('Edit part name:', part.name);
                        if (newName && newName.trim()) {
                          setParts((prev) =>
                            prev.map((p) => (p.id === part.id ? { ...p, name: newName.trim() } : p))
                          );
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}
                      title="Edit part"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInfoModal({
                          isOpen: true,
                          title: 'Part QR Identification',
                          subtitle: part.partCode,
                          content: (
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  padding: 16,
                                  backgroundColor: '#faf8fe',
                                  borderRadius: 12,
                                  border: '2px dashed #c4b5fd',
                                  marginBottom: 12,
                                }}
                              >
                                <QrCode size={90} color="#7c3aed" />
                              </div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{part.name}</div>
                              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                Part Code: <strong>{part.partCode}</strong> • Category: <strong>{part.category}</strong>
                              </div>
                              <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                                Status: {part.status}
                              </div>
                            </div>
                          ),
                        });
                      }}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}
                      title="View QR Code"
                    >
                      <QrCode size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Parts Pagination Navigation */}
      {filteredParts.length > 0 && (
        <div
          style={{
            marginTop: 16,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--omt-color-border, #ebe8f3)',
          }}
        >
          <Pagination
            currentPage={currentPage}
            totalItems={filteredParts.length}
            pageSize={pageSize}
            pageSizeOptions={[6, 12, 18, 36]}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Add Part Modal */}
      {showAddPartModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              maxWidth: 480,
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', margin: 0 }}>Add New Vehicle Part</h2>
              <button
                onClick={() => setShowAddPartModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPart} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Grille, Tailgate Assembly"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  Category Group
                </label>
                <select
                  value={newPartCategory}
                  onChange={(e) => setNewPartCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option value="BODY PANELS">Body Panels</option>
                  <option value="ENGINE">Engine &amp; Drivetrain</option>
                  <option value="ELECTRICAL">Electrical &amp; Lighting</option>
                  <option value="BRAKES">Brakes &amp; Hydraulics</option>
                  <option value="SUSPENSION">Suspension &amp; Steering</option>
                  <option value="INTERIOR">Interior &amp; Trim</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  Extraction Capability
                </label>
                <select
                  value={newPartCanExtract ? 'true' : 'false'}
                  onChange={(e) => setNewPartCanExtract(e.target.value === 'true')}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option value="true">🟢 Can Be Extracted</option>
                  <option value="false">🔴 Cannot Be Extracted</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              maxWidth: 520,
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', margin: 0 }}>Edit Vehicle Asset</h2>
              <button
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.manufactureYear}
                    onChange={(e) => setFormData({ ...formData, manufactureYear: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    Assigned Yard *
                  </label>
                  <select
                    value={formData.yardId}
                    onChange={(e) => setFormData({ ...formData, yardId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                  >
                    {yards.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.yardCode} - {y.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  Routing Disposition
                </label>
                <select
                  value={formData.routingDecision}
                  onChange={(e) => setFormData({ ...formData, routingDecision: e.target.value as RoutingDecision })}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  <option value="DISMANTLE">Dismantle for Parts</option>
                  <option value="KEEP_WHOLE">Keep Whole</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Status Advance Confirmation Modal (Application-Level, replaces window.confirm) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        isLoading={isAdvancingStatus}
        onConfirm={handleConfirmAdvanceStatus}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Info Modal (Application-Level, replaces window.alert) */}
      <InfoModal
        isOpen={infoModal.isOpen}
        title={infoModal.title}
        subtitle={infoModal.subtitle}
        onClose={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}
      >
        {infoModal.content}
      </InfoModal>
    </div>
  );
};
