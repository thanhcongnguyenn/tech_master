import React, { useState, useEffect } from 'react';
import {Container, Row, Col, ButtonGroup, Dropdown, Table, Pagination, Button} from 'react-bootstrap';
import { useSearchParams } from "react-router-dom";
import OrderBreadcrumbs from './components/order/OrderBreadcrumbs';
import apiOrderService from "./../../api/apiOrderService";
import {FaEdit, FaListUl, FaPlusCircle, FaTrash} from "react-icons/fa";
import OrderDetailsModal from './components/order/OrderDetailsModal';
import NewOrderModal from "../admin/components/order/NewOrderModal";
import ModelConfirmDeleteData from "../components/model-delete/ModelConfirmDeleteData";

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({ total: 0, total_page: 1, page: 0, page_size: 10 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState(null); // State quản lý đơn hàng để cập nhật
    const [searchParams, setSearchParams] = useSearchParams();
    const [orderDetails , setOrderDetails] = useState([]);

    // Hàm để gọi lại API và tải danh sách đơn hàng mới nhất
    const refreshOrders = async () => {
        const params = Object.fromEntries([...searchParams]);
        await fetchOrdersWithParams({ ...params, page: params.page || 0, page_size: params.page_size || 10 });
    };

    const fetchOrdersWithParams = async (params) => {
        try {
            const response = await apiOrderService.getLists(params);
            console.info("===========[] ===========[response] : ",response);
            setOrders(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        refreshOrders();
    }, [searchParams]);

    const handleOrderClick = async (order) => {

        try {
            const response = await apiOrderService.showDetail(order.id);
            setOrderDetails(response.data);
            setSelectedOrder(order);
            setShowOrderModal(true);
            console.info("===========[] ===========[response] : ",response);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }

    };

    const handleDeleteData = async (order) => {
        try {
            await apiOrderService.updateOrderStatus(order.id);
            await refreshOrders();
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    const handleUpdateOrderClick = (order) => {
        if (order.status !== 'completed') {
            setOrderToUpdate(order); // Mở modal ở chế độ cập nhật với order được chọn
        } else {
            alert("Không thể chỉnh sửa đơn hàng đã hoàn tất.");
        }
    };

    const getVariant = (status) => {
        switch (status) {
            case 'PENDING':
                return 'primary';
            case 'completed':
                return 'success';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <Container>
            <Row className="gutters mt-3">
                <Col xl={12}>
                    <OrderBreadcrumbs />
                </Col>
            </Row>
            <Row className="gutters">
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Quản lý đơn hàng</h2>
                        {/*<Button size="sm" variant="primary" onClick={() => setOrderToUpdate({})}>*/}
                        {/*    Thêm mới <FaPlusCircle className="mx-1" />*/}
                        {/*</Button>*/}
                    </div>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Mã ĐH</th>
                            <th>Địa chỉ</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, idx) => (
                            <tr key={order.id} style={{ cursor: 'pointer' }}>
                                <td onClick={() => handleOrderClick(order)}>{order.id}</td>
                                <td onClick={() => handleOrderClick(order)}>{order.deliveryInfo}</td>
                                <td onClick={() => handleOrderClick(order)}>{formatCurrency(order.totalAmount)}</td>
                                <td onClick={() => handleOrderClick(order)}>
                                    <span className={`text-${getVariant(order.status)}`}>{order.status}</span>
                                </td>
                                <td>
                                    {/*<Button*/}
                                    {/*    size="sm"*/}
                                    {/*    variant="primary"*/}
                                    {/*    onClick={() => handleUpdateOrderClick(order)}*/}
                                    {/*    title="Cập nhật"*/}
                                    {/*>*/}
                                    {/*    <FaEdit />*/}
                                    {/*</Button>*/}
                                    {order.status === "PENDING" &&  (
                                        <Button
                                            size="sm"
                                            className="ms-2"
                                            variant="danger"
                                            onClick={() => handleDeleteData(order)}
                                            title="Huỷ đơn"
                                        >
                                            <FaTrash />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={meta.page === 1}
                        />
                        <Pagination.Prev
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page === 1}
                        />
                        {Array.from({ length: meta.total_page }, (_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === meta.page}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page === meta.total_page}
                        />
                        <Pagination.Last
                            onClick={() => handlePageChange(meta.total_page)}
                            disabled={meta.page === meta.total_page}
                        />
                    </Pagination>
                </Col>
            </Row>

            <OrderDetailsModal
                show={showOrderModal}
                orderDetails={orderDetails}
                onHide={() => setShowOrderModal(false)}
                order={selectedOrder}
            />

            <NewOrderModal
                show={!!orderToUpdate}
                onHide={() => setOrderToUpdate(null)}
                orderToUpdate={orderToUpdate}
                refreshOrders={refreshOrders} // Truyền hàm callback để làm mới danh sách đơn hàng
            />

            <ModelConfirmDeleteData
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                handleDeleteData={handleDeleteData}
            />
        </Container>
    );
};

export default OrderManager;
