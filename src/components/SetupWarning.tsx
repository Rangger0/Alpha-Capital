import React from 'react';
import { AlertTriangle, FileCode, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SetupWarning: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Alpha Capital" className="h-20 w-auto" />
        </div>

        <Card className="border-amber-500/50 shadow-lg">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-amber-800 dark:text-amber-200">
                Konfigurasi Diperlukan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Alpha Capital memerlukan konfigurasi Supabase untuk berfungsi. 
                Silakan ikuti langkah-langkah berikut:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-lg bg-muted">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Buat Project Supabase</h3>
                    <p className="text-sm text-muted-foreground">
                      Kunjungi{' '}
                      <a 
                        href="https://supabase.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        supabase.com <ExternalLink className="h-3 w-3" />
                      </a>{' '}
                      dan buat project baru.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-muted">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Copy Credentials</h3>
                    <p className="text-sm text-muted-foreground">
                      Dari Settings {'>'} API, copy <strong>Project URL</strong> dan <strong>Anon Key</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-muted">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Setup Environment Variables</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Buat file <code className="bg-muted-foreground/20 px-1 rounded">.env</code> di root project:
                    </p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-muted">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Setup Database</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Jalankan SQL schema di SQL Editor Supabase:
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/supabase-schema.sql" download>
                          <FileCode className="h-4 w-4 mr-2" />
                          Download SQL
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-muted">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Rebuild & Deploy</h3>
                    <p className="text-sm text-muted-foreground">
                      Jalankan <code className="bg-muted-foreground/20 px-1 rounded">npm run build</code> dan deploy ulang.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Alpha Capital © 2026 • Powered by Rose Alpha
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupWarning;
