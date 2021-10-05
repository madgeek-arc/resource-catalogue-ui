export const statusList = ['pending provider', 'pending template submission', 'pending template approval','approved provider'];
// set 'rejected' when the admin rejects provider and
// 'rejected template' when the admin rejects the service template


export const statusChangeMap = {
        'approved provider': {
                     statusId: 'approved provider',
                     appButtonTitle: '',
                     rejButtonTitle: 'Deactivate',
                     onApprove: '',
                     onReject: 'approved provider' //'rejected provider'
        },
        'rejected provider': {
                     statusId: 'rejected provider',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: '',
                     onApprove: 'approved provider',
                     onReject: ''
        },
        'pending provider': {
                     statusId: 'pending provider',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: 'Reject Provider',
                     onApprove: 'approved provider',
                     onReject: 'rejected provider'
        }
    };
