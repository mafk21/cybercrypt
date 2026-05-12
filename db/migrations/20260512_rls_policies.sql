-- Enable RLS on admin tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles: only admins can read/write
CREATE POLICY "Admins can view user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND lower(profiles.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND lower(profiles.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

-- Policies for security_logs: only admins can read
CREATE POLICY "Admins can view security logs" ON security_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND lower(profiles.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

CREATE POLICY "Admins can insert security logs" ON security_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND lower(profiles.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

-- Policies for admin_settings: only admins can read/write
CREATE POLICY "Admins can view admin settings" ON admin_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND lower(profiles.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

CREATE POLICY "Admins can manage admin settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND lower(profiles.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

-- Ensure profiles RLS allows admins to read all
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND lower(p.email) IN ('mbm143105@gmail.com', 'pepsi0man2345@gmail.com')
    )
  );

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Similar for other tables if needed