import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type OrderStatus = "pending" | "in-progress" | "completed";

export interface OrderData {
  id: string;
  orderDate: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  shoulder: string;
  shoulderFullLength: string;
  frontNeckDepth: string;
  chest: string;
  waist: string;
  backNeckDepth: string;
  blouseLength: string;
  sleeveLength: string;
  sleeveRound: string;
  armHole: string;
  blouseType: string;
  hookPosition: string;
  deliveryDate: string;
  extraClothsLaces: string;
  selectedDesign: string;
  designDescription: string;
  specialRequests: string;
  wantMeasurementHelp: boolean;
  status: OrderStatus;
}

interface DbOrder {
  id: string;
  order_date: string;
  full_name: string;
  email: string;
  phone: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  shoulder: string | null;
  full_shoulder: string | null;
  front_neck_depth: string | null;
  chest: string | null;
  waist: string | null;
  back_neck_depth: string | null;
  blouse_back_length: string | null;
  sleeve_length: string | null;
  sleeve_round: string | null;
  arm_hole: string | null;
  blouse_type: string | null;
  hook_position: string | null;
  delivery_date: string | null;
  extra_cloths_laces: string | null;
  selected_design: string | null;
  design_description: string | null;
  special_requests: string | null;
  want_measurement_help: boolean | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const CURRENT_ORDER_KEY = "currentOrder";

// Convert database order to app order format
const dbToAppOrder = (dbOrder: DbOrder): OrderData => ({
  id: dbOrder.id,
  orderDate: dbOrder.order_date,
  fullName: dbOrder.full_name,
  email: dbOrder.email,
  phone: dbOrder.phone,
  street: dbOrder.street || "",
  city: dbOrder.city || "",
  state: dbOrder.state || "",
  zip: dbOrder.zip || "",
  country: dbOrder.country || "",
  shoulder: dbOrder.shoulder || "",
  shoulderFullLength: dbOrder.full_shoulder || "",
  frontNeckDepth: dbOrder.front_neck_depth || "",
  chest: dbOrder.chest || "",
  waist: dbOrder.waist || "",
  backNeckDepth: dbOrder.back_neck_depth || "",
  blouseLength: dbOrder.blouse_back_length || "",
  sleeveLength: dbOrder.sleeve_length || "",
  sleeveRound: dbOrder.sleeve_round || "",
  armHole: dbOrder.arm_hole || "",
  blouseType: dbOrder.blouse_type || "",
  hookPosition: dbOrder.hook_position || "",
  deliveryDate: dbOrder.delivery_date || "",
  extraClothsLaces: dbOrder.extra_cloths_laces || "",
  selectedDesign: dbOrder.selected_design || "",
  designDescription: dbOrder.design_description || "",
  specialRequests: dbOrder.special_requests || "",
  wantMeasurementHelp: dbOrder.want_measurement_help || false,
  status: dbOrder.status as OrderStatus,
});

// Convert app order to database format
const appToDbOrder = (order: Omit<OrderData, "id" | "status">) => ({
  order_date: order.orderDate,
  full_name: order.fullName,
  email: order.email,
  phone: order.phone,
  street: order.street,
  city: order.city,
  state: order.state,
  zip: order.zip,
  country: order.country,
  shoulder: order.shoulder,
  full_shoulder: order.shoulderFullLength,
  front_neck_depth: order.frontNeckDepth,
  chest: order.chest,
  waist: order.waist,
  back_neck_depth: order.backNeckDepth,
  blouse_back_length: order.blouseLength,
  sleeve_length: order.sleeveLength,
  sleeve_round: order.sleeveRound,
  arm_hole: order.armHole,
  blouse_type: order.blouseType,
  hook_position: order.hookPosition,
  delivery_date: order.deliveryDate,
  extra_cloths_laces: order.extraClothsLaces,
  selected_design: order.selectedDesign,
  design_description: order.designDescription,
  special_requests: order.specialRequests,
  want_measurement_help: order.wantMeasurementHelp,
});

// Get all orders from database
export const getAllOrders = async (): Promise<OrderData[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("order_date", { ascending: false });

  if (error) {
    logger.error("getAllOrders", error);
    return [];
  }

  return (data as DbOrder[]).map(dbToAppOrder);
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<OrderData | null> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    logger.error("getOrderById", error);
    return null;
  }

  return dbToAppOrder(data as DbOrder);
};

// Escape special ILIKE pattern characters
const escapePattern = (str: string) => str.replace(/[%_\\]/g, '\\$&');

// Search orders by query across multiple fields
export const searchOrders = async (query: string): Promise<OrderData[]> => {
  const searchTerm = `%${escapePattern(query)}%`;
  
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},city.ilike.${searchTerm},state.ilike.${searchTerm},blouse_type.ilike.${searchTerm},selected_design.ilike.${searchTerm}`)
    .order("order_date", { ascending: false });

  if (error) {
    logger.error("searchOrders", error);
    return [];
  }

  return (data as DbOrder[]).map(dbToAppOrder);
};

// Get orders by customer phone
export const getOrdersByPhone = async (phone: string): Promise<OrderData[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("phone", `%${escapePattern(phone)}%`)
    .order("order_date", { ascending: false });

  if (error) {
    logger.error("getOrdersByPhone", error);
    return [];
  }

  return (data as DbOrder[]).map(dbToAppOrder);
};

// Get orders by customer email
export const getOrdersByEmail = async (email: string): Promise<OrderData[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("email", `%${escapePattern(email)}%`)
    .order("order_date", { ascending: false });

  if (error) {
    logger.error("getOrdersByEmail", error);
    return [];
  }

  return (data as DbOrder[]).map(dbToAppOrder);
};

// Get orders by customer name (partial match)
export const getOrdersByName = async (name: string): Promise<OrderData[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("full_name", `%${escapePattern(name)}%`)
    .order("order_date", { ascending: false });

  if (error) {
    logger.error("getOrdersByName", error);
    return [];
  }

  return (data as DbOrder[]).map(dbToAppOrder);
};

// Get current order from sessionStorage
export const getCurrentOrder = (): OrderData | null => {
  const orderData = sessionStorage.getItem(CURRENT_ORDER_KEY);
  return orderData ? JSON.parse(orderData) : null;
};

// Save current order to sessionStorage
export const setCurrentOrder = (order: OrderData): void => {
  sessionStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(order));
};

// Clear current order from sessionStorage
export const clearCurrentOrder = (): void => {
  sessionStorage.removeItem(CURRENT_ORDER_KEY);
};

// Save order to database
export const saveOrder = async (order: Omit<OrderData, "id" | "status">): Promise<OrderData | null> => {
  const dbOrder = appToDbOrder(order);
  
  // Generate UUID client-side to avoid needing SELECT permission after insert
  const orderId = crypto.randomUUID();
  const orderWithId = { ...dbOrder, id: orderId };
  
  const { error } = await supabase
    .from("orders")
    .insert(orderWithId);

  if (error) {
    logger.error("saveOrder", error);
    return null;
  }

  // Return the order data we already have (no need to read back from DB)
  return {
    ...order,
    id: orderId,
    status: 'pending' as OrderStatus
  };
};

// Delete order by ID
export const deleteOrderById = async (orderId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    logger.error("deleteOrderById", error);
    return false;
  }

  return true;
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    logger.error("updateOrderStatus", error);
    return false;
  }

  return true;
};

// Get orders by status
export const getOrdersByStatus = async (status: OrderStatus): Promise<OrderData[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", status)
    .order("order_date", { ascending: false });

  if (error) {
    logger.error("getOrdersByStatus", error);
    return [];
  }

  return (data as DbOrder[]).map(dbToAppOrder);
};

// Get total order count
export const getOrderCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    logger.error("getOrderCount", error);
    return 0;
  }

  return count || 0;
};

// Update order measurements
export const updateOrderMeasurements = async (
  orderId: string,
  measurements: {
    shoulder?: string;
    shoulderFullLength?: string;
    frontNeckDepth?: string;
    chest?: string;
    waist?: string;
    backNeckDepth?: string;
    blouseLength?: string;
    sleeveLength?: string;
    sleeveRound?: string;
    armHole?: string;
    specialRequests?: string;
  }
): Promise<boolean> => {
  const { error } = await supabase
    .from("orders")
    .update({
      shoulder: measurements.shoulder,
      full_shoulder: measurements.shoulderFullLength,
      front_neck_depth: measurements.frontNeckDepth,
      chest: measurements.chest,
      waist: measurements.waist,
      back_neck_depth: measurements.backNeckDepth,
      blouse_back_length: measurements.blouseLength,
      sleeve_length: measurements.sleeveLength,
      sleeve_round: measurements.sleeveRound,
      arm_hole: measurements.armHole,
      special_requests: measurements.specialRequests,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    logger.error("updateOrderMeasurements", error);
    return false;
  }

  return true;
};
