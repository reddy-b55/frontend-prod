import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

export default function TicketSelector({ handleOnPressContinueData, handleClickBack, attractionTickets, loaders }) {
    const ticketData = attractionTickets?.ticket_types || [];

    // Initialize ticket counts state
    const [ticketCounts, setTicketCounts] = useState({});

    // Initialize counts for all ticket types when ticketData changes
    useEffect(() => {
        const initialCounts = {};
        ticketData.forEach(ticket => {
            initialCounts[ticket.product_id] = 0;
        });
        setTicketCounts(initialCounts);
    }, [ticketData]);

    const incrementCount = (productId) => {
        const currentCount = ticketCounts[productId] || 0;
        const ticket = ticketData.find(item => item.product_id === productId);
        const maxCount = ticket?.available_selling_quantities?.slice(-1)[0] || 10;

        if (currentCount < maxCount) {
            setTicketCounts({
                ...ticketCounts,
                [productId]: currentCount + 1
            });
        }
    };

    const decrementCount = (productId) => {
        const currentCount = ticketCounts[productId] || 0;

        if (currentCount > 0) {
            setTicketCounts({
                ...ticketCounts,
                [productId]: currentCount - 1
            });
        }
    };

    const toggleTicketSelection = (productId) => {
        const currentCount = ticketCounts[productId] || 0;
        const newCount = currentCount === 0 ? 1 : 0;

        setTicketCounts({
            ...ticketCounts,
            [productId]: newCount
        });
    };

    const handleBack = () => {
        handleClickBack();
    };

    const handleOnPressContinue = () => {
        const tickets = Object.keys(ticketCounts)
            .filter(productId => ticketCounts[productId] > 0)
            .map(productId => ({
                product_id: productId,
                quantity: ticketCounts[productId],
            }));

        const ticketData = {
            tickets: tickets
        };

        handleOnPressContinueData(ticketData);
    };

    // Check if any tickets are selected
    const hasSelectedTickets = Object.values(ticketCounts).some(count => count > 0);

    const removeHtmlTags = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};



    return (
        <Container className="py-4">
            {/* <Row className="mb-4">
                <Col xs={2} className="d-flex align-items-center">
                    <Button
                        variant="light"
                        className="rounded-circle shadow-sm"
                        onClick={handleBack}
                        style={{ width: '40px', height: '40px', padding: 0 }}
                    >
                        <span aria-hidden="true">&larr;</span>
                        <span className="visually-hidden">Back</span>
                    </Button>
                </Col>
                <Col xs={8} className="text-center">
                    <h4 className="fw-bold mb-0">Select Tickets</h4>
                </Col>
                <Col xs={2}></Col>
            </Row> */}

            <div className="ticket-list overflow-auto" style={{ maxHeight: '60vh' }}>
                {ticketData.map((ticket) => (
                    <Card
                        key={ticket.product_id}
                        className="mb-3 shadow-sm border-0 rounded-4"
                    >
                        <Card.Body className="d-flex align-items-center">
                            <div
                                className={`ticket-checkbox me-3 d-flex align-items-center justify-content-center ${ticketCounts[ticket.product_id] > 0 ? 'bg-primary' : 'bg-white'}`}
                                onClick={() => toggleTicketSelection(ticket.product_id)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    border: '2px solid #0d6efd',
                                    cursor: 'pointer'
                                }}
                            >
                                {ticketCounts[ticket.product_id] > 0 && (
                                    <span className="text-white fw-bold" style={{ fontSize: '14px' }}>&#10003;</span>
                                )}
                            </div>

                            <div className="ticket-info flex-grow-1">
                                <h5 className="mb-1">{ticket.name}</h5>
                                <p className="text-muted mb-1 small">{removeHtmlTags(ticket.description)}</p>

                                {ticket.age_from && (
                                    <p className="text-secondary mb-0 small fst-italic">
                                        Ages {ticket.age_from} to {ticket.age_to}
                                    </p>
                                )}
                            </div>

                            <div className="ticket-counter d-flex align-items-center">
                                <Button
                                    variant={ticketCounts[ticket.product_id] > 0 ? "primary" : "secondary"}
                                    className="d-flex align-items-center justify-content-center rounded-2"
                                    size="sm"
                                    onClick={() => decrementCount(ticket.product_id)}
                                    disabled={!ticketCounts[ticket.product_id]}
                                    style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                    <span>−</span>
                                </Button>

                                <div className="px-3 fw-bold" style={{ width: '40px', textAlign: 'center' }}>
                                    {ticketCounts[ticket.product_id] || 0}
                                </div>

                                <Button
                                    variant="primary"
                                    className="d-flex align-items-center justify-content-center rounded-2"
                                    size="sm"
                                    onClick={() => incrementCount(ticket.product_id)}
                                    disabled={ticketCounts[ticket.product_id] === (ticket.available_selling_quantities?.slice(-1)[0] || 10)}
                                    style={{ width: '32px', height: '32px', padding: 0 }}
                                >
                                    <span>+</span>
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <Card className="mt-4 shadow-sm border-0">
                <Card.Body>
                    <Button
                        variant="primary"
                        className="w-100 py-3 d-flex align-items-center justify-content-center"
                        disabled={!hasSelectedTickets}
                        onClick={handleOnPressContinue}
                    >
                        <span className="me-2">Continue to Booking</span>
                        {loaders ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <span aria-hidden="true">&rarr;</span>
                        )}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}