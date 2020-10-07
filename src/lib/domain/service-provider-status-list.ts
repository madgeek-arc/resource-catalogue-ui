export const statusList = ['pending initial approval', 'pending template submission', 'pending template approval','approved'];
// set 'rejected' when the admin rejects provider and
// 'rejected template' when the admin rejects the service template


export const statusChangeMap = {
        'approved': {
                     statusId: 'APPROVED',
                     appButtonTitle: '',
                     rejButtonTitle: 'Deactivate',
                     onApprove: '',
                     onReject: 'approved'
        },
        'rejected': {
                     statusId: 'REJECTED',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: '',
                     onApprove: 'pending template submission',
                     onReject: ''
        },
        'pending initial approval': {
                     statusId: 'PENDING_1',
                     appButtonTitle: 'Approve Provider',
                     rejButtonTitle: 'Reject Provider',
                     onApprove: 'pending template submission',
                     onReject: 'rejected'
        },
        'pending template submission': {
            statusId: 'ST_SUBMISSION',
            appButtonTitle: '',
            rejButtonTitle: 'Reject Provider',
            onApprove: '',
            onReject: 'rejected'
        },
        'pending template approval': {
                     statusId: 'PENDING_2',
                     appButtonTitle: 'Approve Template',
                     rejButtonTitle: 'Reject Template',
                     onApprove: 'approved',
                     onReject: 'rejected template'
        },
        'rejected template': {
                     statusId: 'REJECTED_ST',
                     appButtonTitle: 'Approve Template',
                     rejButtonTitle: 'Reject Provider',
                     onApprove: 'approved',
                     onReject: 'rejected'
        }
    };
