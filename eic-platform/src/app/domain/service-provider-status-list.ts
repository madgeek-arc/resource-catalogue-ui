export const statusList = ['pending initial approval', 'pending service template submission', 'pending service template approval','approved'];
// set 'rejected' when the admin rejects sp and
// 'rejected st' when the admin rejects the service template


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
                     appButtonTitle: '',
                     rejButtonTitle: '',
                     onApprove: '',
                     onReject: ''
        },
        'pending initial approval': {
                     statusId: 'PENDING_1',
                     appButtonTitle: 'Approve SP',
                     rejButtonTitle: 'Reject SP',
                     onApprove: 'pending service template submission',
                     onReject: 'rejected'
        },
        'pending service template submission': {
            statusId: 'ST_SUBMISSION',
            appButtonTitle: '',
            rejButtonTitle: 'Reject SP',
            onApprove: '',
            onReject: 'rejected'
        },
        'pending service template approval': {
                     statusId: 'PENDING_2',
                     appButtonTitle: 'Approve ST',
                     rejButtonTitle: 'Reject ST',
                     onApprove: 'approved',
                     onReject: 'rejected service template'
        },
        'rejected service template': {
                     statusId: 'REJECTED_ST',
                     appButtonTitle: 'Approve ST',
                     rejButtonTitle: 'Reject ST',
                     onApprove: 'approved',
                     onReject: 'rejected service template'
        }
    };
