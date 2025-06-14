
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppointmentTimeline } from './AppointmentTimeline';
import { RecordAttendanceDialog } from './RecordAttendanceDialog';
import { AddFollowUpDialog } from './AddFollowUpDialog';
import { CompleteFollowUpDialog } from './CompleteFollowUpDialog';
import { useAppointmentRecords } from '@/hooks/useAppointmentRecords';
import { useFollowUps } from '@/hooks/useFollowUps';
import { Appointment } from '@/types/appointment';
import { FollowUp } from '@/types/appointmentRecord';

interface ViewAppointmentTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const ViewAppointmentTimelineDialog = ({ open, onOpenChange, appointment }: ViewAppointmentTimelineDialogProps) => {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [completeFollowUpDialogOpen, setCompleteFollowUpDialogOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  const { records, getRecordsByAppointment } = useAppointmentRecords();
  const { followUps, getFollowUpsByAppointment } = useFollowUps();

  if (!appointment) return null;

  const appointmentRecords = getRecordsByAppointment(appointment.id);
  const appointmentFollowUps = getFollowUpsByAppointment(appointment.id);

  const handleCompleteFollowUp = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp);
    setCompleteFollowUpDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timeline - {appointment.title}</DialogTitle>
          </DialogHeader>
          
          <AppointmentTimeline
            appointment={appointment}
            records={appointmentRecords}
            followUps={appointmentFollowUps}
            onRecordAttendance={() => setRecordDialogOpen(true)}
            onAddFollowUp={() => setFollowUpDialogOpen(true)}
            onCompleteFollowUp={handleCompleteFollowUp}
          />
        </DialogContent>
      </Dialog>

      <RecordAttendanceDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        appointment={appointment}
      />

      <AddFollowUpDialog
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        appointment={appointment}
        appointmentRecordId={appointmentRecords[0]?.id}
      />

      <CompleteFollowUpDialog
        open={completeFollowUpDialogOpen}
        onOpenChange={setCompleteFollowUpDialogOpen}
        followUp={selectedFollowUp}
      />
    </>
  );
};
