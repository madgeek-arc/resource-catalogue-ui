export const statusList = ['pending initial approval', 'pending template submission', 'pending template approval','approved'];
// set 'rejected' when the admin rejects provider and
// 'rejected template' when the admin rejects the service template


export const statusChangeMap = {
        'approved': {
                     statusId: 'approved',
                     appButtonTitle: '',
                     rejButtonTitle: 'Deactivate',
                     onApprove: '',
                     onReject: 'approved'
        },
        'rejected': {
                     statusId: 'rejected',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: '',
                     onApprove: 'pending template submission',
                     onReject: ''
        },
        'pending initial approval': {
                     statusId: 'pending initial approval',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: 'Reject Provider',
                     onApprove: 'pending template submission',
                     onReject: 'rejected'
        },
        'pending template submission': {
            statusId: 'pending template submission',
            appButtonTitle: '',
            rejButtonTitle: 'Reject Provider',
            onApprove: '',
            onReject: 'rejected'
        },
        'pending template approval': {
                     statusId: 'pending template approval',
                     appButtonTitle: 'Approve Template',
                     rejButtonTitle: 'Reject Template',
                     onApprove: 'approved',
                     onReject: 'rejected template'
        },
        'rejected template': {
                     statusId: 'rejected template',
                     appButtonTitle: 'Approve Template',
                     rejButtonTitle: 'Reject Provider',
                     onApprove: 'approved',
                     onReject: 'rejected'
        }
    };
