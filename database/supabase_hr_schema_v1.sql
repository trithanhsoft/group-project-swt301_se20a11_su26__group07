-- public.shifts Table Definition
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hourly_rate NUMERIC NOT NULL CHECK (hourly_rate >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- public.staff_availability Table Definition
CREATE TABLE IF NOT EXISTS public.staff_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT staff_availability_unique UNIQUE (staff_id, available_date, start_time, end_time)
);

-- public.staff_shifts Table Definition
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'COMPLETED', 'ABSENT')),
    hourly_rate_snapshot NUMERIC NOT NULL CHECK (hourly_rate_snapshot >= 0),
    total_salary NUMERIC NOT NULL DEFAULT 0 CHECK (total_salary >= 0),
    custom_start_time TIME,
    custom_end_time TIME,
    created_by UUID REFERENCES public.app_users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT staff_shifts_unique UNIQUE (staff_id, shift_date, shift_id)
);

-- public.staff_requests Table Definition
CREATE TABLE IF NOT EXISTS public.staff_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('LEAVE', 'SWAP')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reason TEXT NOT NULL,
    target_date DATE NOT NULL,
    target_shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    swap_with_staff_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    processed_by UUID REFERENCES public.app_users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for HR module performance
CREATE INDEX IF NOT EXISTS idx_staff_availability_date ON public.staff_availability (available_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON public.staff_shifts (shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_requests_status ON public.staff_requests (status);
CREATE INDEX IF NOT EXISTS idx_staff_requests_date ON public.staff_requests (target_date);
