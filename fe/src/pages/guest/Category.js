import React, { useEffect, useState, useTransition } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Dropdown, Pagination, Nav, Button, Form } from 'react-bootstrap';
import './style/Category.css';
import './../components/product/ProductCarousel.css';
import categoryService from '../../api/categoryService';
import CategorySkeleton from './../components/loading/CategorySkeleton';
import ProductSkeleton from './../components/loading/ProductSkeleton';
import apiProductService from "../../api/apiProductService";
import {createSlug, formatPrice} from "../../helpers/formatters";

const Category = () => {
    const { slug } = useParams();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('SẢN PHẨM');
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [sortOption, setSortOption] = useState('newest');
    const [ratingFilter, setRatingFilter] = useState(null);
    const [selectedLabel, setSelectedLabel] = useState(null); // Thêm state để lưu nhãn được chọn

    // Fetch danh sách categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await categoryService.getListsGuest();
                console.info("===========[] ===========[response] : ",response);
                setCategories(response.data);

                // Cập nhật tên danh mục dựa trên slug
                const currentCategory = response.data.find(cat => createSlug(cat.name) === slug);
                if (currentCategory) {
                    setCategoryName(currentCategory.name);
                } else {
                    setCategoryName('SẢN PHẨM');
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setTimeout(() => setLoadingCategories(false), 1000);
            }
        };
        fetchCategories();
    }, [slug]);


    // Fetch sản phẩm theo category và các tùy chọn sắp xếp/lọc
    useEffect(() => {
        startTransition(() => {
            setLoadingProducts(true);
            const fetchProducts = async () => {
                try {
                    const category = categories.find(cat => createSlug(cat.name) === slug);
                    const response = await apiProductService.getLists({
                        page: currentPage,
                        page_size: 10,
                        category_id: category?.id,
                        sort: sortOption,
                        rating: ratingFilter,
                        name : ''
                    });
                    setProducts(response.data.data);
                    setTotalPages(response.data.meta.total_page);
                } catch (error) {
                    console.error("Error fetching products:", error);
                } finally {
                    setTimeout(() => setLoadingProducts(false), 1000);
                }
            };
            if (categories.length > 0 && slug) fetchProducts();
        });
    }, [slug, categories, currentPage, sortOption, ratingFilter, selectedLabel]);

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    // Xử lý lọc theo đánh giá
    const handleRatingFilterChange = (rating) => {
        setRatingFilter(rating);
    };

    // Xử lý lọc sản phẩm theo nhãn
    const handleLabelFilterChange = (labelId) => {
        setSelectedLabel(labelId);
    };

    return (
        <Container className="category-container">
            <Row>
                <Col md={3}>
                    <h4>DANH MỤC SẢN PHẨM</h4>
                    {loadingCategories ? (
                        <CategorySkeleton />
                    ) : (
                        <ul className="category-list">
                            {categories.map((category) => (
                                <li key={category.id} className={category.slug === slug ? 'active' : ''}>
                                    <Link to={`/c/${category.slug}`}>{category.name}</Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Khối Sắp xếp */}
                    <h5 className="mt-4">Sắp xếp</h5>
                    <Form.Select aria-label="Sắp xếp" value={sortOption} onChange={handleSortChange}>
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="price-asc">Giá tăng dần</option>
                        <option value="price-desc">Giá giảm dần</option>
                    </Form.Select>

                    {/* Khối Lọc theo đánh giá */}
                    <h5 className="mt-4">Lọc theo đánh giá</h5>
                    <div className="rating-filter">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <Button
                                key={rating}
                                size={'sm'}
                                variant={ratingFilter === rating ? 'primary' : 'outline-primary'}
                                onClick={() => handleRatingFilterChange(rating)}
                                className="mb-2 me-2"
                            >
                                {rating} sao
                            </Button>
                        ))}
                        <Button
                            variant={!ratingFilter ? 'primary' : 'outline-primary'}
                            size={'sm'}
                            onClick={() => handleRatingFilterChange(null)}
                            className="mb-2 ms-2"
                        >
                            Tất cả
                        </Button>
                    </div>
                </Col>
                <Col md={9}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4>{categoryName}</h4>
                    </div>
                    <Row>
                        {loadingProducts || isPending ? (
                            Array.from({ length: 8 }).map((_, idx) => (
                                <Col md={3} key={idx}>
                                    <ProductSkeleton />
                                </Col>
                            ))
                        ) : (
                            products.map((product, idx) => (
                                <Col md={3} key={idx} className={'item-prod'}>
                                    <Card className="mb-4 card-prod">
                                        {/*<Card.Img variant="top" src={product.avatar} />*/}
                                        <Nav.Link as={Link} to={`/p/${createSlug(product.name)}-${product.id}`}>
                                            <Card.Img variant="top" src={product.image} alt={product.name} style={{ height: '200px'}} />
                                        </Nav.Link>
                                        <Card.Body>
                                            <Card.Title>
                                                <Nav.Link as={Link} to={`p/${createSlug(product.name)}-${product.id}`}>{product.name}</Nav.Link>
                                            </Card.Title>
                                            <Card.Text>{formatPrice(product.salePrice)}</Card.Text>
                                        </Card.Body>
                                        <Button variant={product.quantity > 0 ? 'success' : 'danger'}>
                                            {product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                        </Button>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                    {totalPages > 0 && (
                        <Pagination className="justify-content-center">
                            <Pagination.First onClick={() => setCurrentPage(1)} />
                            <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                            {[...Array(totalPages)].map((_, idx) => (
                                <Pagination.Item
                                    key={idx}
                                    active={idx + 1 === currentPage}
                                    onClick={() => setCurrentPage(idx + 1)}
                                >
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                            <Pagination.Last onClick={() => setCurrentPage(totalPages)} />
                        </Pagination>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Category;
