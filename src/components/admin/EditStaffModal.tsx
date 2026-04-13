import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Phone, Mail, Key, IdCard } from 'lucide-react';

interface StaffRow {
  id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  user_id: string;
  department_id: string | null;
}

interface EditStaffModalProps {
  staff: StaffRow | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({ staff, open, onClose, onUpdated }) => {
  const [fullName, setFullName] = useState(staff?.full_name || '');
  const [phone, setPhone] = useState(staff?.phone || '');
  const [staffCode, setStaffCode] = useState(staff?.staff_code || '');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (staff) {
      setFullName(staff.full_name);
      setPhone(staff.phone || '');
      setStaffCode(staff.staff_code);
      setNewPassword('');
    }
  }, [staff]);

  const handleSave = async () => {
    if (!staff) return;
    setSaving(true);

    try {
      // Update staff table
      const { error: staffError } = await supabase
        .from('staff')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          staff_code: staffCode.trim(),
        })
        .eq('id', staff.id);

      if (staffError) throw staffError;

      // Reset password if provided
      if (newPassword.trim().length > 0) {
        if (newPassword.trim().length < 6) {
          toast.error('Password must be at least 6 characters');
          setSaving(false);
          return;
        }
        // Call edge function to reset password (requires service role)
        const { data, error: fnError } = await supabase.functions.invoke('update-staff-password', {
          body: { user_id: staff.user_id, new_password: newPassword.trim() },
        });
        if (fnError) {
          console.error('Password reset error:', fnError);
          toast.error('Staff details updated but password reset failed. An edge function may need to be deployed.');
        } else {
          toast.success('Staff details and password updated successfully');
          setSaving(false);
          onUpdated();
          onClose();
          return;
        }
      }

      toast.success('Staff details updated successfully');
      onUpdated();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to update staff: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Modify Staff Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <IdCard className="w-4 h-4" /> Staff Code / ID
            </Label>
            <Input value={staffCode} onChange={(e) => setStaffCode(e.target.value)} placeholder="e.g. CSE001" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </Label>
            <Input value={staff?.email || ''} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="w-4 h-4" /> Reset Password
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStaffModal;
