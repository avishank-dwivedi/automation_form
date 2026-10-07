import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  RefreshCw,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Download,
  Upload,
  QrCode,
  ShieldCheck,
  Zap,
  X,
  Radio
} from 'lucide-react';

export default function SyncModal() {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    syncRoomCode,
    setSyncRoomCode,
    syncStatus,
    lastSyncTime,
    pairedDevices,
    broadcastState,
    exportDataToJson,
    importDataFromJson,
    language
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [syncingAnim, setSyncingAnim] = useState(false);

  if (!isSyncModalOpen) return null;

  const isHindi = language === 'hi';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(syncRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerManualSync = () => {
    setSyncingAnim(true);
    broadcastState();
    setTimeout(() => {
      setSyncingAnim(false);
    }, 800);
  };

  const handlePairWithCode = (e) => {
    e.preventDefault();
    if (!manualCodeInput) return;
    setSyncRoomCode(manualCodeInput.toUpperCase());
    broadcastState();
    alert(`Connected to device pair session: ${manualCodeInput.toUpperCase()}`);
    setManualCodeInput('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px', width: '92%', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              color: '#ffffff',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {isHindi ? 'PC व मोबाइल लाइव डाटा सिंक' : 'PC & Mobile Synchronisation'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isHindi ? 'कंप्यूटर और मोबाइल में एक साथ रियल-टाइम डाटा सिंक' : 'Real-time bidirectional synchronization across devices'}
              </p>
            </div>
          </div>

          <button onClick={() => setIsSyncModalOpen(false)} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Live Status Card */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 81, 50, 0.16) 100%)',
          border: '1.5px solid var(--primary-400)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981',
                display: 'inline-block'
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary-700)' }}>
                {isHindi ? 'सिंक स्थिति: सक्रिय व सुरक्षित' : 'Sync Status: Active & Connected'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {pairedDevices} {isHindi ? 'डिवाइस जुड़े हैं' : 'Paired Devices'} (PC + Mobile) • Last synced at {lastSyncTime}
              </div>
            </div>
          </div>

          <button
            onClick={handleTriggerManualSync}
            className="btn-primary"
            style={{ padding: '7px 12px', fontSize: '0.8rem', gap: '6px' }}
          >
            <RefreshCw size={13} className={syncingAnim ? 'animate-spin' : ''} />
            {syncingAnim ? 'Syncing...' : (isHindi ? 'तुरंत सिंक करें' : 'Sync Now')}
          </button>
        </div>

        {/* 6-Digit Device Pairing Code & QR Simulation */}
        <div style={{
          background: 'var(--bg-surface-alt)',
          padding: '18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                {isHindi ? 'आपका डिवाइस सिंक कोड' : 'Device Pairing Session Code'}
              </div>
              <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-700)', letterSpacing: '0.08em' }}>
                {syncRoomCode}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem', gap: '6px' }}
            >
              {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {isHindi
              ? 'मोबाइल में यह 6-अंकों का कोड दर्ज करें, या किसी अन्य ब्राउज़र टैब में खोलें। जो भी बिल या स्टॉक PC में बनेगा, वह मोबाइल पर तत्काल दिखेगा।'
              : 'Enter this 6-digit code on your mobile device or open another tab. Any bill, stock, or payment entered on PC synchronises instantly to mobile.'}
          </div>

          {/* Connect to existing code input */}
          <form onSubmit={handlePairWithCode} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <input
              type="text"
              placeholder="Enter another code e.g. JKV-1234"
              className="font-mono"
              style={{ flex: 1, textTransform: 'uppercase', fontSize: '0.85rem' }}
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              {isHindi ? 'लिंक करें' : 'Pair Devices'}
            </button>
          </form>
        </div>

        {/* Offline Backup & Cloud Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Offline First:</strong> All records stored locally on this machine.
          </div>

          <button
            onClick={exportDataToJson}
            className="btn-outline-primary"
            style={{ padding: '7px 12px', fontSize: '0.8rem', gap: '6px' }}
          >
            <Download size={14} /> {isHindi ? 'पूरा डेटा बैकअप लें' : 'Export Data (JSON)'}
          </button>
        </div>
      </div>
    </div>
  );
}
