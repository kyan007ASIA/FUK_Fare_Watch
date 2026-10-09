import React, { useState } from 'react';
import { Currency } from '../types';
import { formatPrice } from '../data/corridorData';
import { createAlertSubscription } from '../api';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onAlertCreated: (alertData: any) => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAlertCreated
}) => {
  const [email, setEmail] = useState('changi.trader@singapore.com');
  const [telegram, setTelegram] = useState('@sg_farewatch_bot');
  const [thresholdSGD, setThresholdSGD] = useState<number>(720);
  const [depDate, setDepDate] = useState('2025-10-18');
  const [retDate, setRetDate] = useState('2025-10-28');
  const [notifyOnStateChange, setNotifyOnStateChange] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert = await createAlertSubscription({
      corridor: 'SIN ⇄ FUK (Direct Only)',
      email,
      telegram,
      recChangeNotify: notifyOnStateChange,
      priceThresholdSGD: thresholdSGD
    });
    onAlertCreated(newAlert);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#181c23] border border-[#31353d] rounded-xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-space-lg border-b border-[#262a32] flex items-center justify-between bg-[#1c2027]">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded bg-[#4edea3]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
              <span className="material-symbols-outlined text-[18px]">add_alert</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-[#dfe2ed]">
                Create Algorithmic Alert
              </h2>
              <span className="font-label-mono-sm text-xs text-[#8f9097]">
                SIN ⇄ FUK Direct Route Telemetry
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8f9097] hover:text-[#dfe2ed] hover:bg-[#31353d] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content / Form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="p-space-lg flex flex-col gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-xs text-[#8f9097] uppercase">
                TARGET EMAIL DISPATCH
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0e15] border border-[#31353d] rounded px-3 py-2 text-sm text-[#dfe2ed] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-xs text-[#8f9097] uppercase flex items-center justify-between">
                <span>TELEGRAM BOT ID (OPTIONAL)</span>
                <span className="text-[#4edea3] text-[10px]">Instant Webhook</span>
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username or bot token"
                className="w-full bg-[#0a0e15] border border-[#31353d] rounded px-3 py-2 text-sm text-[#dfe2ed] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-mono-sm text-xs text-[#8f9097] uppercase">DEPARTURE</label>
                <input
                  type="date"
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                  className="bg-[#0a0e15] border border-[#31353d] rounded px-3 py-2 text-sm text-[#dfe2ed] cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-mono-sm text-xs text-[#8f9097] uppercase">RETURN</label>
                <input
                  type="date"
                  value={retDate}
                  onChange={(e) => setRetDate(e.target.value)}
                  className="bg-[#0a0e15] border border-[#31353d] rounded px-3 py-2 text-sm text-[#dfe2ed] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 rounded bg-[#0a0e15] border border-[#262a32] flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnStateChange}
                  onChange={(e) => setNotifyOnStateChange(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#4edea3]"
                />
                <span className="text-xs text-[#dfe2ed]">
                  Alert when ML state flips (e.g. HOLD to BUY NOW)
                </span>
              </label>

              <div className="flex items-center justify-between pt-1 border-t border-[#262a32] text-xs">
                <span className="text-[#c5c6cd]">Price Drop Trigger Floor:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[#8f9097]">S$</span>
                  <input
                    type="number"
                    value={thresholdSGD}
                    onChange={(e) => setThresholdSGD(Number(e.target.value))}
                    className="w-20 bg-[#1c2027] border border-[#45474d] rounded px-2 py-1 text-right text-[#4edea3] font-bold"
                  />
                  <span className="text-[#8f9097] text-[11px]">
                    ({formatPrice(thresholdSGD, currency)})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs text-[#c5c6cd] hover:text-[#dfe2ed] hover:bg-[#262a32] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-[#4edea3] text-[#003824] font-semibold text-xs hover:bg-[#6ffbbe] shadow-lg cursor-pointer"
              >
                Activate Subscription
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
              Alert Subscribed Successfully!
            </h3>
            <p className="font-body-sm text-xs text-[#8f9097] max-w-xs">
              Live telemetry ping registered for {email}. You will receive instant notifications when pricing drops below {formatPrice(thresholdSGD, currency)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
