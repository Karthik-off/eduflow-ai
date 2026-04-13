-- Update the fees category check constraint to include 'lab' as a valid category
ALTER TABLE public.fees 
DROP CONSTRAINT IF EXISTS fees_category_check;

-- Add the updated constraint with lab included
ALTER TABLE public.fees 
ADD CONSTRAINT fees_category_check 
CHECK (category = ANY (ARRAY['tuition'::text, 'bus'::text, 'exam'::text, 'discretionary'::text, 'lab'::text]));