export const statusList = ['pending', 'approved', 'rejected'];

export const resourceStatusChangeMap = {
  'pending': {
    statusId: 'pending',
    appButtonTitle: 'Approve Resource',
    rejButtonTitle: 'Reject Resource',
    onApprove: 'approved',
    onReject: 'rejected'
  },
  'approved': {
    statusId: 'approved',
    appButtonTitle: '',
    rejButtonTitle: 'Deactivate',
    onApprove: '',
    onReject: 'approved' //'rejected resource'
  },
  'rejected': {
    statusId: 'rejected',
    appButtonTitle: 'Approve Resource',
    rejButtonTitle: '',
    onApprove: 'approved',
    onReject: ''
  }
};
