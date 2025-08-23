-- 创建一个函数，当在auth.users中创建新用户时，自动在我们自己的users表中创建记录
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 检查users表中是否已存在该用户
  if not exists (select 1 from public.users where id = new.id) then
    -- 插入新用户到我们自己的users表
    insert into public.users (id, email, google_id, avatar_url, credits, created_at, updated_at)
    values (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'sub',  -- Google ID
      new.raw_user_meta_data->>'picture',  -- Avatar URL
      20,  -- 初始积分
      now(), 
      now()
    );
    
    -- 记录积分交易
    insert into public.credit_transactions (user_id, type, amount, description, created_at)
    values (
      new.id,
      'credit',
      20,
      '新用户注册奖励',
      now()
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器，当在auth.users中插入新用户时执行
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();