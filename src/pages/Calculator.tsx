import React, { useState } from 'react';
import { Calculator, Delete, Divide, Minus, Plus, X as Times } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { TerminalCard, TerminalButton } from '@/components/ui/TerminalCard';
import { useLanguage } from '@/contexts/LanguageContext';

const isSafeExpression = (expr: string) => /^[0-9+\-*/().\s]*$/.test(expr);

const CalculatorPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  const append = (val: string) => {
    setExpression((prev) => (prev === '0' ? val : prev + val));
  };

  const clearAll = () => {
    setExpression('');
    setResult('0');
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    if (!expression) return;
    if (!isSafeExpression(expression)) return;
    try {
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${expression || '0'})`)();
      const formatted = Number.isFinite(val) ? val.toString() : 'Error';
      setResult(formatted);
    } catch (e) {
      setResult('Error');
    }
  };

  const keypad: string[] = [
    'AC', 'DEL', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  const handleKey = (key: string) => {
    if (key === '=') return calculate();
    if (key === 'AC') return clearAll();
    if (key === 'DEL') return backspace();
    append(key);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={language === 'id' ? 'Utilitas' : 'Utility'}
          title={language === 'id' ? 'Kalkulator' : 'Calculator'}
          subtitle={language === 'id' ? 'untuk hitung cepat & kirim ke transaksi.' : ''}
          action={
            <TerminalButton onClick={() => navigate('/transactions/new')}>
              {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
            </TerminalButton>
          }
        />

        <TerminalCard title="calculator" subtitle={language === 'id' ? '' : ''} glow>
          <div className="mx-auto max-w-[420px] space-y-4 rounded-3xl border border-border bg-card/90 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full bg-[hsl(var(--finance-negative))]" />
                <span className="h-3 w-3 rounded-full bg-[hsl(var(--finance-warning))]" />
                <span className="h-3 w-3 rounded-full bg-[hsl(var(--finance-positive))]" />
              </div>
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Calculator className="h-4 w-4" />
                Calc
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right font-mono text-2xl text-foreground shadow-inner">
              <div className="text-sm text-muted-foreground truncate">{expression || '0'}</div>
              <div className="text-3xl font-semibold tracking-tight">{result}</div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-lg font-semibold">
              {keypad.map((k) => {
                const isOp = ['/', '*', '-', '+', '%'].includes(k);
                const isEqual = k === '=';
                const isWide = k === '0';
                return (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    className={`rounded-full px-4 py-3 shadow-sm transition-colors ${isWide ? 'col-span-2 text-left pl-6' : ''} ${
                      isEqual
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : isOp
                          ? 'bg-muted text-primary hover:bg-muted/80'
                          : ['AC', 'DEL'].includes(k)
                            ? 'bg-muted text-foreground hover:bg-muted/80'
                            : 'bg-card border border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {k === '/' && <Divide className="mx-auto h-4 w-4" />}
                    {k === '*' && <Times className="mx-auto h-4 w-4" />}
                    {k === '-' && <Minus className="mx-auto h-4 w-4" />}
                    {k === '+' && <Plus className="mx-auto h-4 w-4" />}
                    {k === 'DEL' && <Delete className="mx-auto h-4 w-4" />}
                    {['/', '*', '-', '+', 'DEL'].includes(k) ? null : k}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <TerminalButton onClick={() => navigate('/transactions/new')} className="w-full" size="sm">
                {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
              </TerminalButton>
              <TerminalButton variant="ghost" onClick={clearAll} className="w-full" size="sm">
                {language === 'id' ? 'Reset' : 'Reset'}
              </TerminalButton>
            </div>
          </div>
        </TerminalCard>
      </div>
    </Layout>
  );
};

export default CalculatorPage;
