import React from 'react'
import { Skeleton, Stack } from '@mui/material';

function MainPageLoaders(props) {
  return (
    props.category === 'essproductloader' ?
      Array.from({ length: props.count }, (_, index) =>
        <div className='' style={{ height: '52vh', width: '24%' }} key={index}>
          <Skeleton variant="rounded" width={'100%'} height={'60%'} style={{ marginBottom: 10 }} />
          <Skeleton variant="rounded" width={'80%'} height={'5%'} style={{ marginBottom: 10 }} />
          <Skeleton variant="rounded" width={'100%'} height={'5%'} style={{ marginBottom: 10 }} />
          <Skeleton variant="rounded" width={'100%'} height={'5%'} style={{ marginBottom: 10 }} />
          <div className="d-flex gap-2" style={{ height: '100%' }}>
            <Skeleton variant="rounded" width={'45%'} height={'5%'} style={{ marginBottom: 10 }} />
            <Skeleton variant="rounded" width={'45%'} height={'5%'} style={{ marginBottom: 10 }} />
          </div>
        </div>
      )
      :
      props.category === "eduproductloader" ?
        Array.from({ length: props.count }, (_, index) =>
          <div className='d-flex gap-3' key={index}>
            <Skeleton variant="rounded" width={180} height={170} style={{ marginBottom: 10 }} />
            <div>
              <Skeleton variant="rounded" width={400} height={40} style={{ marginBottom: 10 }} />
              <Skeleton variant="rounded" width={400} height={15} style={{ marginBottom: 10 }} />
              <div className="d-flex gap-2">
                <Skeleton variant="rounded" width={250} height={15} style={{ marginBottom: 10 }} />
                <Skeleton variant="rounded" width={250} height={15} style={{ marginBottom: 10 }} />
              </div>
              <Skeleton variant="rounded" width={250} height={15} style={{ marginBottom: 10 }} />
              <Skeleton variant="rounded" width={180} height={15} style={{ marginBottom: 10 }} />
              <div className="d-flex gap-2">
                <Skeleton variant="rounded" width={40} height={20} style={{ marginBottom: 10 }} />
                <Skeleton variant="rounded" width={40} height={20} style={{ marginBottom: 10 }} />
                <Skeleton variant="rounded" width={40} height={20} style={{ marginBottom: 10 }} />
              </div>
            </div>
            <div className="d-flex flex-column justify-content-end align-items-end">
              <Skeleton variant="rounded" width={130} height={15} style={{ marginBottom: 10 }} />
              <Skeleton variant="rounded" width={130} height={15} style={{ marginBottom: 10 }} />
              <Skeleton variant="rounded" width={180} height={30} style={{ marginBottom: 10 }} />
            </div>
          </div>
        )
        :
        props.category === "filterloader" ?
          <div className='d-flex flex-column'>
            {
              Array.from({ length: props.count }, (_, index) =>
                <div key={index}>
                  <Skeleton variant="rounded" width={130} height={15} style={{ marginBottom: 10 }} />
                  <Skeleton variant="rounded" width={310} height={145} style={{ marginBottom: 10 }} />
                </div>
              )
            }
          </div>
          :
          props.category === "hotelsLoader" ?
            Array.from({ length: props.count }, (_, index) =>
              <div className='d-flex gap-3' key={index}>
                <Skeleton variant="rounded" width={180} height={170} style={{ marginBottom: 10 }} />
                <div className='d-flex align-items-start flex-column justify-content-between'>
                  <Skeleton variant="rounded" width={400} height={40} style={{ marginBottom: 10 }} />
                  <Skeleton variant="rounded" width={510} height={20} style={{ marginBottom: 10 }} />
                  <Skeleton variant="rounded" width={510} height={20} style={{ marginBottom: 10 }} />
                  <Skeleton variant="rounded" width={510} height={20} style={{ marginBottom: 10 }} />
                  <div className='d-flex justify-content-between'>
                    <Skeleton variant="rounded" width={240} height={20} style={{ marginBottom: 10 }} />
                    <Skeleton variant="rounded" width={240} height={20} style={{ marginBottom: 10 }} />
                  </div>
                </div>
                <div className='d-flex align-items-end flex-column justify-content-between'>
                  <div className='d-flex flex-column justify-content-start align-items-end'>
                    <Skeleton variant="rounded" width={100} height={10} style={{ marginBottom: 10 }} />
                    <Skeleton variant="rounded" width={150} height={10} style={{ marginBottom: 10 }} />
                  </div>
                  <div className='d-flex flex-column justify-content-start align-items-end'>
                    <Skeleton variant="rounded" width={150} height={10} style={{ marginBottom: 10 }} />
                    <Skeleton variant="rounded" width={180} height={30} style={{ marginBottom: 10 }} />
                    <Skeleton variant="rounded" width={180} height={30} style={{ marginBottom: 10 }} />
                  </div>
                </div>
              </div>
            )
            :
            props.category === 'searchPageLoader' ?
              Array.from({ length: props.count }, (_, index) =>
                <div key={index}>
                  <Skeleton variant="rounded" width={400} height={20} style={{ marginBottom: 10 }} />
                  <div className="d-flex gap-3">
                    <Skeleton variant="rounded" width={250} height={260} style={{ marginBottom: 10 }} />
                    <div>
                      <Skeleton variant="rounded" width={600} height={30} style={{ marginBottom: 10 }} />
                      <div className="d-flex justify-content-start gap-3">
                        <Skeleton variant="rounded" width={390} height={30} style={{ marginBottom: 10 }} />
                        <Skeleton variant="rounded" width={390} height={30} style={{ marginBottom: 10 }} />
                      </div>
                      <Skeleton variant="rounded" width={700} height={100} style={{ marginBottom: 10 }} />
                      <div className="d-flex justify-content-start gap-3">
                        <Skeleton variant="rounded" width={390} height={70} style={{ marginBottom: 10 }} />
                        <Skeleton variant="rounded" width={390} height={70} style={{ marginBottom: 10 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
              :
              props.category === 'lifestyleMain-produtLoader' ?
                Array.from({ length: props.count }, (_, index) =>
                  <div key={index}>
                    <Skeleton variant="rounded" width={240} height={20} style={{ marginBottom: 10 }} />
                    <Skeleton variant="rounded" width={240} height={190} style={{ marginBottom: 10 }} />
                    <Skeleton variant="rounded" width={240} height={20} style={{ marginBottom: 10 }} />
                    <div className='d-flex justify-content-between'>
                      <Skeleton variant="rounded" width={110} height={10} style={{ marginBottom: 10 }} />
                      <Skeleton variant="rounded" width={110} height={10} style={{ marginBottom: 10 }} />
                    </div>
                    <Skeleton variant="rounded" width={110} height={10} style={{ marginBottom: 10 }} />
                  </div>
                ) :
                props.category === 'ess-extraloader' ?
                  <Skeleton variant="rounded" width={'100%'} height={50} style={{ marginBottom: 10 }} />
                  : Array.from({ length: props.count }, (_, index) =>
                    <Skeleton variant="rounded" width={props.width} height={props.height} key={index} style={{ marginBottom: 10 }} />
                  )
  )
}

export default MainPageLoaders