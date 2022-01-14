export const statusList = ['pending resource', 'approved resource', 'rejected resource'];

export const resourceStatusChangeMap = {
  'pending resource': {
    statusId: 'pending resource',
    appButtonTitle: 'Approve Resource',
    rejButtonTitle: 'Reject Resource',
    onApprove: 'approved resource',
    onReject: 'rejected resource'
  },
  'approved resource': {
    statusId: 'approved resource',
    appButtonTitle: '',
    rejButtonTitle: 'Deactivate',
    onApprove: '',
    onReject: 'approved resource' //'rejected resource'
  },
  'rejected resource': {
    statusId: 'rejected resource',
    appButtonTitle: 'Approve Resource',
    rejButtonTitle: '',
    onApprove: 'approved resource',
    onReject: ''
  }
};
