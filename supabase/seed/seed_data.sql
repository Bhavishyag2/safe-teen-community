-- Seed data for development and testing
-- Run this after migrations to populate initial data

-- Note: In production, users would be created through the auth flow
-- This seed data is for development purposes only

-- Insert test admin user (after auth.users is created)
-- In development, first create a user via Supabase Auth, then update:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Additional school email domains for testing
INSERT INTO school_email_domains (domain, school_name, city, state, is_verified) VALUES
  ('studentmail.com', 'Generic Student Email', NULL, NULL, TRUE),
  ('testschool.edu.in', 'Test School', 'Mumbai', 'Maharashtra', TRUE)
ON CONFLICT (domain) DO NOTHING;

-- Sample expert content (articles)
-- Note: These would normally be created through the admin dashboard

-- Sample sections content
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Try to get an admin user for authoring
  SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;

  -- If no admin exists, skip content seeding
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Skipping content seed.';
    RETURN;
  END IF;

  -- Relationships section
  INSERT INTO content (type, section, title, body, author_id, status, is_expert_content, tags)
  VALUES (
    'article',
    'relationships',
    'Understanding Healthy Friendships',
    E'Friendships are one of the most important parts of our lives, especially during our teenage years. But how do you know if a friendship is healthy?\n\n## Signs of a Healthy Friendship\n\n1. **Mutual Respect**: Your friend respects your boundaries and opinions, even when they disagree.\n\n2. **Support**: They''re there for you during tough times, not just the fun ones.\n\n3. **Honesty**: They tell you the truth, kindly, even when it''s hard to hear.\n\n4. **Equal Effort**: Both of you put in effort to maintain the friendship.\n\n## Red Flags to Watch For\n\n- They only reach out when they need something\n- They share your secrets with others\n- They put you down, even as "jokes"\n- They try to control who you spend time with\n\nRemember, it''s okay to outgrow friendships. As you grow, your needs change, and that''s perfectly normal!',
    admin_id,
    'approved',
    TRUE,
    ARRAY['friendships', 'healthy relationships', 'boundaries']
  );

  -- Health section
  INSERT INTO content (type, section, title, body, author_id, status, is_expert_content, tags)
  VALUES (
    'article',
    'health',
    'Managing Stress During Exams',
    E'Exam season can be overwhelming, but there are healthy ways to manage stress.\n\n## Quick Stress Relief Techniques\n\n1. **Deep Breathing**: Try the 4-7-8 technique. Breathe in for 4 seconds, hold for 7, exhale for 8.\n\n2. **Take Breaks**: Study in 25-minute blocks with 5-minute breaks (Pomodoro technique).\n\n3. **Move Your Body**: Even a 10-minute walk can help clear your mind.\n\n4. **Stay Hydrated**: Drink water! Dehydration affects concentration.\n\n## Study Tips\n\n- Create a realistic study schedule\n- Use active recall instead of just re-reading\n- Get enough sleep - your brain consolidates memories while you sleep\n- Avoid cramming the night before\n\n## When to Seek Help\n\nIf you''re feeling constantly anxious, having trouble sleeping for days, or having thoughts of harming yourself, please reach out to a trusted adult or counselor. You''re not alone!',
    admin_id,
    'approved',
    TRUE,
    ARRAY['mental health', 'stress', 'exams', 'study tips']
  );

  -- Period Health section
  INSERT INTO content (type, section, title, body, author_id, status, is_expert_content, tags)
  VALUES (
    'article',
    'period_health',
    'Your First Period: What to Expect',
    E'Getting your first period is a normal part of growing up, but it can feel confusing or scary if you don''t know what to expect.\n\n## What Is a Period?\n\nA period is when your body sheds the lining of your uterus. This happens about once a month and lasts 3-7 days.\n\n## Signs Your Period Might Be Coming\n\n- Breast development\n- Pubic hair growth\n- Clear or white discharge\n- Mood changes\n\n## What to Keep in Your Kit\n\n- Pads or tampons\n- Spare underwear\n- Pain relief (if approved by your parent)\n- A small bag to carry everything discreetly\n\n## Tracking Your Cycle\n\nIt''s helpful to track your periods using a calendar or app. This helps you:\n- Know when to expect your next period\n- Notice any irregularities to discuss with a doctor\n- Plan for events and activities\n\n## Remember\n\nEvery girl''s experience is different. Your period might be light or heavy, regular or irregular at first. If you have concerns, talk to a trusted adult or doctor.',
    admin_id,
    'approved',
    TRUE,
    ARRAY['periods', 'puberty', 'menstrual health', 'first period']
  );

  -- School section
  INSERT INTO content (type, section, title, body, author_id, status, is_expert_content, tags)
  VALUES (
    'article',
    'school',
    'Dealing with Peer Pressure',
    E'Peer pressure is something almost everyone faces. Here''s how to handle it while staying true to yourself.\n\n## Types of Peer Pressure\n\n- **Direct**: "Come on, everyone''s doing it"\n- **Indirect**: Feeling left out if you don''t participate\n- **Positive**: Friends encouraging healthy habits\n\n## How to Say No\n\n1. **Be direct**: "No thanks, I''m not into that"\n2. **Blame your parents**: "My parents would ground me forever"\n3. **Suggest an alternative**: "Let''s do something else instead"\n4. **Use humor**: "Nah, I like my brain cells where they are"\n\n## Building Confidence\n\n- Know your values before you''re in a tough situation\n- Surround yourself with friends who respect your choices\n- Remember that saying no is a sign of strength, not weakness\n\n## It''s Okay to Walk Away\n\nIf a situation feels wrong, trust your gut. Real friends won''t pressure you into doing things that make you uncomfortable.',
    admin_id,
    'approved',
    TRUE,
    ARRAY['peer pressure', 'confidence', 'school life', 'friendships']
  );

  -- Career section
  INSERT INTO content (type, section, title, body, author_id, status, is_expert_content, tags)
  VALUES (
    'article',
    'career',
    'Exploring Career Options: Where Do I Start?',
    E'Feeling confused about what you want to do in the future? You''re not alone!\n\n## It''s Okay to Not Know\n\nMost teens don''t have their entire future figured out, and that''s completely normal. Career paths often change multiple times throughout life.\n\n## Self-Discovery Questions\n\n- What subjects do you enjoy most in school?\n- What activities make you lose track of time?\n- What problems do you wish you could solve?\n- What do people often ask for your help with?\n\n## Explore Different Fields\n\n- **STEM**: Science, Technology, Engineering, Math\n- **Creative Arts**: Design, Music, Writing, Film\n- **Healthcare**: Medicine, Psychology, Nutrition\n- **Business**: Marketing, Finance, Entrepreneurship\n- **Social Sciences**: Law, Education, Social Work\n\n## Take Small Steps\n\n1. Research careers that interest you\n2. Talk to people in those fields\n3. Look for internship or volunteer opportunities\n4. Join clubs or activities related to your interests\n\n## Remember\n\nYour interests might change, and that''s okay! The goal right now is to explore and learn about yourself.',
    admin_id,
    'approved',
    TRUE,
    ARRAY['career', 'future goals', 'college prep', 'career exploration']
  );

END $$;

-- Sample forum posts (would normally be user-generated)
-- Skipping for now as they require active user accounts

RAISE NOTICE 'Seed data inserted successfully!';
