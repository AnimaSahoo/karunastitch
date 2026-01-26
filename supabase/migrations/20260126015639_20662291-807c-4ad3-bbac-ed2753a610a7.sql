-- Create orders table for persistent storage
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  blouse_back_length TEXT,
  full_shoulder TEXT,
  shoulder_strap TEXT,
  back_neck_depth TEXT,
  front_neck_depth TEXT,
  shoulder_to_apex TEXT,
  front_length TEXT,
  chest TEXT,
  waist TEXT,
  sleeve_length TEXT,
  arm_round TEXT,
  sleeve_round TEXT,
  arm_hole TEXT,
  blouse_type TEXT,
  hook_position TEXT,
  delivery_date TEXT,
  extra_cloths_laces TEXT,
  selected_design TEXT,
  design_description TEXT,
  special_requests TEXT,
  want_measurement_help BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (admin can view all orders)
CREATE POLICY "Allow public read access to orders" 
ON public.orders 
FOR SELECT 
USING (true);

-- Create policy for public insert (anyone can place an order)
CREATE POLICY "Allow public insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public update (admin can update status)
CREATE POLICY "Allow public update orders" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Create policy for public delete (admin can delete orders)
CREATE POLICY "Allow public delete orders" 
ON public.orders 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better search performance
CREATE INDEX idx_orders_full_name ON public.orders USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_orders_email ON public.orders (email);
CREATE INDEX idx_orders_phone ON public.orders (phone);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_order_date ON public.orders (order_date DESC);