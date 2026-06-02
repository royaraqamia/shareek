-- PostgreSQL Migration: 20260602000001_rls_policies.sql
-- Enable Row Level Security (RLS) on all tables and configure policies

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_or_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch the current user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Organizations Policies
-- Allow users associated with the organization to view it
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (id = get_user_org_id());

CREATE POLICY "Admins can update their own organization" ON organizations
  FOR UPDATE USING (
    id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- 2. Profiles Policies
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Contacts Policies
CREATE POLICY "Users can CRUD contacts in their organization" ON contacts
  FOR ALL USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

-- 4. Products/Services Policies
CREATE POLICY "Users can CRUD products in their organization" ON products_or_services
  FOR ALL USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

-- 5. Transactions Policies
CREATE POLICY "Users can CRUD transactions in their organization" ON transactions
  FOR ALL USING (organization_id = get_user_org_id()) WITH CHECK (organization_id = get_user_org_id());

-- 6. Transaction Items Policies
CREATE POLICY "Users can CRUD transaction items in their organization" ON transaction_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_items.transaction_id 
        AND transactions.organization_id = get_user_org_id()
    )
  );
