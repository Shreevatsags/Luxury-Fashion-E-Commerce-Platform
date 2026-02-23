
-- Categories table (public read)
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- Products table (public read)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Carts table (one per user)
CREATE TABLE public.carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cart" ON public.carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own cart" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.carts FOR UPDATE USING (auth.uid() = user_id);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cart items" ON public.cart_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Users can add to own cart" ON public.cart_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
