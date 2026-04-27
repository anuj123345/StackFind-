"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Loader2, Check, ArrowRight } from "lucide-react"

interface ExportEmailModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (email: string) => Promise<void>
  initialEmail?: string
}

export function ExportEmailModal({ isOpen, onClose, onExport, initialEmail = "" }: ExportEmailModalProps) {
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return
    
    setLoading(true)
    setError("")
    try {
      await onExport(email)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to send email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[151] p-6"
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#8C6E50]/15"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Mail className="text-indigo-600" size={20} />
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X size={18} className="text-[#A0907E]" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-[#1C1611] mb-2 font-bricolage">
                  {success ? "Success!" : "Email your Blueprint"}
                </h3>
                <p className="text-sm text-[#7A6A57] mb-6 leading-relaxed">
                  {success 
                    ? "Your project blueprint has been sent to your inbox. Check your email shortly."
                    : "We'll send a professionally formatted version of your stack and build plan to your email."
                  }
                </p>

                {!success && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-4 pr-4 py-3 rounded-xl bg-[#8C6E50]/5 border border-[#8C6E50]/15 text-sm font-medium outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending...</>
                      ) : (
                        <>Send Blueprint <ArrowRight size={16} /></>
                      )}
                    </button>
                  </form>
                )}

                {success && (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <Check className="text-emerald-600" size={24} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
