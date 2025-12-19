import { Skeleton } from '@mui/material'
import React from 'react'

function ProductSkeleton({ skelotonType }) {
    return (
        <div className='w-100 mb-5'>
            {
                skelotonType === 'productDetails' ?
                    <div className='d-flex gap-3 w-100 h-100'>
                        <Skeleton variant="rounded" width="50%" height='auto' />
                        <div className='d-flex flex-column gap-3 h-100 w-100'>
                            <Skeleton variant="rounded" width="100%" height={40} />
                            <Skeleton variant="rounded" width="100%" height={70} />
                            <Skeleton variant="rounded" width="60%" height={30} />
                            <Skeleton variant="rounded" width="50%" height={15} />
                            <Skeleton variant="rounded" width="100%" height={40} />
                            <Skeleton variant="rounded" width="100%" height={40} />
                            <div className='d-flex justify-content-end gap-3'>
                                <Skeleton variant="rounded" width="30%" height={40} />
                                <Skeleton variant="rounded" width="30%" height={40} />
                            </div>
                        </div>
                    </div>
                    :

                    skelotonType === 'productDetails-left-moreDetails' ?
                        <div className='d-flex flex-column gap-3 h-100 w-100'>
                            <Skeleton variant="rounded" width={'60%'} height={20} />
                            <div className='d-flex gap-3 align-items-center'>
                                <Skeleton variant="rounded" width={'15%'} height={35} />
                                <Skeleton variant="rounded" width={'80%'} height={35} />
                            </div>
                            <div className='d-flex gap-3 align-items-center'>
                                <Skeleton variant="rounded" width={'15%'} height={35} />
                                <Skeleton variant="rounded" width={'80%'} height={35} />
                            </div>
                            <div className='d-flex gap-3 align-items-center'>
                                <Skeleton variant="rounded" width={'15%'} height={35} />
                                <Skeleton variant="rounded" width={'80%'} height={35} />
                            </div>
                            <div className='d-flex gap-3 align-items-center'>
                                <Skeleton variant="rounded" width={'15%'} height={35} />
                                <Skeleton variant="rounded" width={'80%'} height={35} />
                            </div>
                            <Skeleton variant="rounded" width={'60%'} height={20} />
                            <div className='d-flex gap-3 align-items-center'>
                                <Skeleton variant="rounded" width={'15%'} height={40} />
                                <Skeleton variant="rounded" width={'80%'} height={40} />
                            </div>
                            <div className='d-flex gap-3 align-items-center'>
                                <Skeleton variant="rounded" width={'15%'} height={40} />
                                <Skeleton variant="rounded" width={'80%'} height={40} />
                            </div>
                        </div>
                        :
                        <Skeleton variant="rounded" width={210} height={118} />
            }
        </div>
    )
}

export default ProductSkeleton