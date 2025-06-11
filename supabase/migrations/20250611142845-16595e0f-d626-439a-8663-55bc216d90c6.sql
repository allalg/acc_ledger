
-- Create a function to execute custom SQL queries
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data json;
BEGIN
    -- Execute the dynamic SQL and return as JSON
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result_data;
    
    -- Return the result wrapped in a consistent format
    RETURN json_build_object('result', COALESCE(result_data, '[]'::json));
EXCEPTION WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object('error', SQLERRM);
END;
$$;
