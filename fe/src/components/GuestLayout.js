import React, { useState, useEffect, startTransition } from 'react';
import { Container, Navbar, Nav, Dropdown, Badge, Alert } from 'react-bootstrap';
import {Outlet, Link, useLocation, useNavigate} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import HomeCarousel from "../pages/components/slide/HomeCarousel";
import Footer from "../pages/components/footer/Footer";
import { FaShoppingCart } from 'react-icons/fa';
import { loadUserFromLocalStorage, logout } from '../redux/slices/authSlice';
// import BookingModal from './guest/BookingModal';
import categoryService from "../api/categoryService";
import {createSlug} from "../helpers/formatters"; // Import ConsultationModal

const GuestLayout = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const API = process.env.REACT_APP_API_BASE_URL;

    const itemCount = useSelector((state) => state.cart.itemCount);
    const handleLogout = () => {
        dispatch(logout());
    };

    useEffect(() => {
        dispatch(loadUserFromLocalStorage());
    }, [dispatch]);
    const bgLogo = "/images/bg-login.webp"
    const [showBooking, setShowBooking] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const handleBookingClose = () => setShowBooking(false);
    const handleBookingShow = () => setShowBooking(true);

    // Gọi API để lấy danh sách category khi component được mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getListsGuest({}); // Gọi API lấy category
                setCategories(response.data); // Lưu danh sách category vào state
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            <Navbar bg="" variant="dark" style={{ backgroundColor: '#15397f' }}>
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src={bgLogo} alt="Logo" style={{ width: '80px' }} />
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        <Dropdown>
                            <Dropdown.Toggle as={Nav.Link} id="dropdown-custom-components">
                                Sản phẩm
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {categories?.length > 0 ? (
                                    categories.map((category) => (
                                        <Dropdown.Item as={Link} to={`/c/${createSlug(category.name)}`} key={category.id}>
                                            {category.name}
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Item>Không có sản phẩm</Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/cart" className="position-relative">
                            <FaShoppingCart size={24} />
                            {/*{itemCount > 0 && (*/}
                            {/*    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">*/}
                            {/*        {itemCount}*/}
                            {/*    </Badge>*/}
                            {/*)}*/}
                        </Nav.Link>
                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle as={Nav.Link} id="dropdown-user">
                                    <img
                                        src={user?.avatar || 'https://via.placeholder.com/150'}
                                        alt="Avatar"
                                        style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 10 }}
                                    />
                                    {user?.name}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/user/profile">Cập nhật thông tin</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/user/orders">Đơn hàng</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link}
                                          to="/login"
                                          onClick={(e) => {
                                              e.preventDefault();
                                              startTransition(() => {
                                                  navigate("/login");
                                              });
                                          }}
                                >Đăng nhập</Nav.Link>
                                <Nav.Link as={Link}
                                          to="/register"
                                          onClick={(e) => {
                                              e.preventDefault();
                                              startTransition(() => {
                                                  navigate("/register");
                                              });
                                          }}
                                >
                                    Đăng ký
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Container>
            </Navbar>
            {/* Hiển thị thông báo thành công nếu có */}
            {successMessage && (
                <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
                    {successMessage}
                </Alert>
            )}
            {location.pathname === '/' && <HomeCarousel />}

            <Container>
                <Outlet />
            </Container>
            <Footer />

            {/* Modal đặt lịch */}
            {/*<BookingModal*/}
            {/*    show={showBooking}*/}
            {/*    handleClose={handleBookingClose}*/}
            {/*    API={API}*/}
            {/*    setSuccessMessage={setSuccessMessage}*/}
            {/*/>*/}
        </>
    );
};

export default GuestLayout;
