import { useEffect, useMemo, useState } from 'react';
import { useOrdersContext } from '../context/OrdersContext';

export const useOrders = (options = {}) => {
  const { orders: allOrders, loading, error, changeOrderStatus } = useOrdersContext();

  const filteredOrders = useMemo(() => {
    if (!options?.status) return allOrders;
    return allOrders.filter((order) => order.status === options.status);
  }, [allOrders, options?.status]);

  return {
    orders: filteredOrders,
    loading,
    error,
    hasMore: false,
    reload: () => {},
    loadMore: () => {},
    updateOrderStatus: changeOrderStatus
  };
};

export const useOrder = (orderId) => {
  const { ordersMap, getOrderById } = useOrdersContext();
  const [order, setOrder] = useState(() => (orderId ? ordersMap[orderId] || null : null));
  const [loading, setLoading] = useState(() => !ordersMap[orderId] && Boolean(orderId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    if (ordersMap[orderId]) {
      setOrder(ordersMap[orderId]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getOrderById(orderId)
      .then((data) => {
        if (active) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [orderId, ordersMap, getOrderById]);

  return { order, loading, error };
};

