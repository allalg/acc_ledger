
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ledgerData, ledgerType, filename } = await req.json();

    if (!ledgerData || !Array.isArray(ledgerData) || ledgerData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data provided for PDF generation' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${ledgerType || 'Ledger'}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #4ade80;
            padding-bottom: 10px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4ade80;
            margin-bottom: 10px;
          }
          .title { 
            font-size: 20px; 
            font-weight: bold;
            color: #374151;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #d1d5db; 
            padding: 6px; 
            text-align: left;
          }
          th { 
            background-color: #f3f4f6; 
            font-weight: bold;
            color: #374151;
          }
          .currency { 
            text-align: right; 
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
          }
          .break-page {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Acco Sight</div>
          <div class="title">${ledgerType || 'Financial Report'}</div>
          <div>Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              ${Object.keys(ledgerData[0] || {}).map(key => 
                `<th>${key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${ledgerData.map(row => `
              <tr>
                ${Object.entries(row).map(([key, value]) => {
                  const isCurrency = key.includes('balance') || key.includes('value') || key.includes('amount') || key.includes('debit') || key.includes('credit');
                  let formattedValue = value;
                  
                  if (isCurrency && typeof value === 'number') {
                    formattedValue = `₹${Math.abs(value).toLocaleString('en-IN')}`;
                  } else if (key.includes('date') && value) {
                    formattedValue = new Date(value).toLocaleDateString('en-IN');
                  }
                  
                  return `<td class="${isCurrency ? 'currency' : ''}">${formattedValue || '-'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is a system-generated report from Acco Sight Financial Management System</p>
        </div>
      </body>
      </html>
    `;

    // Return the HTML content as a downloadable file
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename || 'report'}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
