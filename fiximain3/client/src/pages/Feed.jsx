import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ComplaintCard from '../components/ComplaintCard';

const API_URL = 'http://localhost:5000/api/complaints';

const Feed = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchComplaints = async () => {
        try {
            const res = await axios.get(API_URL);
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load feed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleUpvote = async (id) => {
        try {
            // Optimistic update (in a real app, complex logic needed)
            await axios.post(`${API_URL}/upvote/${id}`);
            fetchComplaints(); // Refresh to see server-side changes
        } catch (err) {
            alert("Login required to upvote or server error.");
        }
    };

    return (
        <Container className="py-5">
            <div className="mb-4">
                <h2 className="fw-bold">Public Feed</h2>
                <p className="text-muted">Live updates on city issues reported by citizens.</p>
            </div>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && complaints.length === 0 && (
                <Alert variant="info">No complaints yet. Be the first to report!</Alert>
            )}

            <Row>
                <Col md={8} className="mx-auto">
                    {complaints.map(item => (
                        <ComplaintCard key={item._id} complaint={item} onUpvote={handleUpvote} />
                    ))}
                </Col>
            </Row>
        </Container>
    );
};

export default Feed;
