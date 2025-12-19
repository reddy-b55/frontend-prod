import Head from 'next/head';
import React from 'react';
import CommonLayout from '../../../../../components/shop/common-layout';
import { Container } from 'reactstrap';

const ErrorComponent = ({ message }) => {
    return (
        <>
            <Head>
                <title>Aahaas - Order Details</title>
            </Head>

            <CommonLayout parent="order-history" title="error">

                <Container>
                    {/* <div className="back-button-container">
          <Button color="primary" onClick={() => router.back()}>
            ← Back
          </Button>
        </div> */}
                    <section className="order-details">


                        <div className="error-container">
                            <h2>Error</h2>
                            <p>{message || 'Something went wrong. Please try again later.'}</p>

                            <style jsx>{`
        .error-container {
          text-align: center;
          padding: 40px;
          color: #d32f2f;
          background: #fdecea;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          margin: 20px;
        }

        h2 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        p {
          font-size: 1.1rem;
        }
      `}</style>
                        </div>

                    </section>
                </Container>
            </CommonLayout>

        </>
    );
};

export default ErrorComponent;
