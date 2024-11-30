import React, {startTransition} from 'react';
import {Container, Navbar, Nav, NavDropdown, Dropdown} from 'react-bootstrap';
import {Outlet, Link, useNavigate} from 'react-router-dom';
import './UserLayout.css';
import {logout} from "../redux/slices/authSlice";
import {useDispatch} from "react-redux";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = ({ isAuthenticated, user, onLogout }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        dispatch(logout()); // Dispatch action logout để đăng xuất người dùng
        navigate('/login');
    };
    console.info("===========[] ===========[OK VAO DAY] : ");

    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to="/admin">ADMIN</Navbar.Brand>
                    <Nav className="me-auto">
                        <Dropdown as={Nav.Item}>
                            <Dropdown.Toggle as={Nav.Link} id="dropdown-ecm">
                                Bán hàng
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to="/admin/ecommerce/brand">Thương hiệu</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/admin/ecommerce/categories">Danh mục</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/admin/ecommerce/voucher">Voucher</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/admin/ecommerce/product">Sản phẩm</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/admin/ecommerce/order">Đơn hàng</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown as={Nav.Item}>
                            <Dropdown.Toggle as={Nav.Link} id="dropdown-ecm">
                                Dữ liệu website
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to="/admin/slides">Quản lý slide</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                    <Nav>
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
                                <Dropdown.Item as={Link} to="/admin/profile">Cập nhật thông tin</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                    onClick={(e) => {
                                        e.preventDefault();
                                        startTransition(() => {
                                            navigate("/login");
                                        });
                                    }}
                                >Đăng xuất</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Container>
            </Navbar>
            <Container style={{ minHeight: '70vh',paddingBottom: '100px'}}>
                <Outlet />
            </Container>
            <footer className="admin-footer text-center mt-4">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} Company Name. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="/help">Help</a> |
                        <a href="/privacy-policy">Privacy Policy</a> |
                        <a href="/terms-of-service">Terms of Service</a>
                    </div>
                </div>
            </footer>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </>
    );
};

export default AdminLayout;
