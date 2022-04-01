export const statusList = ['pending catalogue', 'pending template submission', 'pending template approval','approved catalogue'];
// set 'rejected' when the admin rejects catalogue and
// 'rejected template' when the admin rejects the service template


export const statusChangeMap = {
  'approved catalogue': {
    statusId: 'approved catalogue',
    appButtonTitle: '',
    rejButtonTitle: 'Deactivate',
    onApprove: '',
    onReject: 'approved catalogue' //'rejected catalogue'
  },
  'rejected catalogue': {
    statusId: 'rejected catalogue',
    appButtonTitle: 'Approve Catalogue',
    rejButtonTitle: '',
    onApprove: 'approved catalogue',
    onReject: ''
  },
  'pending catalogue': {
    statusId: 'pending catalogue',
    appButtonTitle: 'Approve Catalogue',
    rejButtonTitle: 'Reject Catalogue',
    onApprove: 'approved catalogue',
    onReject: 'rejected catalogue'
  }
};
