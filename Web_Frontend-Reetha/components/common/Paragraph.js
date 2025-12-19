import React from 'react';
import { Container, Row, Col } from 'reactstrap';

const Paragraph = ({ title, inner, ParagraphSubTittle, ParagraphDesc }) => {
    return (
        <div>
            <div className={title}>
                <h2 className={inner}>{ParagraphSubTittle}</h2>
            </div>
            <Container>
                <Row>
                    <Col lg="10" className="m-auto">
                        <div className="product-para">
                            <p className="text-center ellipsis-2-lines-mobile mb-2 mb-lg-5 mt-lg-2">{ParagraphDesc}</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Paragraph;