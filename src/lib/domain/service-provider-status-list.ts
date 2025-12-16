export const statusList = ['pending', 'pending template submission', 'pending template approval','approved'];
// set 'rejected' when the admin rejects provider and
// 'rejected template' when the admin rejects the service template


export const statusChangeMap = {
        'approved': {
                     statusId: 'approved',
                     appButtonTitle: '',
                     rejButtonTitle: 'Deactivate',
                     onApprove: '',
                     onReject: 'approved' //'rejected provider'
        },
        'rejected': {
                     statusId: 'rejected',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: '',
                     onApprove: 'approved',
                     onReject: ''
        },
        'pending': {
                     statusId: 'pending',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: 'Reject Provider',
                     onApprove: 'approved',
                     onReject: 'rejected'
        }
    };
