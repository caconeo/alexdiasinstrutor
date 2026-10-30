import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building,
  Users,
  GraduationCap,
  TrendingUp,
  Database,
  RefreshCw,
  Search,
  Eye,
  Sliders,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Calendar,
  CheckSquare,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Link2,
  Phone,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { db, CadastrosIntegrityReport } from '../../lib/storage';
import { formatCurrencyBRL, formatDateBR } from '../../lib/validation';
import { Organization, User, Student } from '../../types';

interface AdminMasterPanelProps {
  currentUser: User;
  onSwitchUser: (email: string) => void;
}

export const AdminMasterPanel: React.FC<AdminMasterPanelProps> = ({ currentUser, onSwitchUser }) => {
  const organizations = db.getOrganizations();
  const allUsers = db.getUsers();
  const allStudents = db.getStudents(organizations[0]?.id || '');
  const allPayments = db.getPayments(organizations[0]?.id || '');
  const allAuditLogs = db.getAuditLogs(organizations[0]?.id || '');

  const [activeSubTab, setActiveSubTab] = useState<'VERIFICADOR' | 'ORGS' | 'MAINTENANCE'>('VERIFICADOR');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [expandedInstructorId, setExpandedInstructorId] = useState<string | null>(null);

  // Reassignment Modal state
  const [studentToReassign, setStudentToReassign] = useState<Student | null>(null);
  const [targetInstructorId, setTargetInstructorId] = useState<string>('');
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState<string>('');

  // Integrity Report
  const [integrityReport, setIntegrityReport] = useState<CadastrosIntegrityReport>(() =>
    db.verifyCadastrosIntegrity(organizations[0]?.id)
  );

  const runIntegrityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const report = db.verifyCadastrosIntegrity(organizations[0]?.id);
      setIntegrityReport(report);
      setIsScanning(false);
    }, 450);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToReassign || !targetInstructorId) return;

    const ok = db.reassignStudentInstructor(studentToReassign.id, targetInstructorId, currentUser.id);
    if (ok) {
      const targetInstructor = allUsers.find((u) => u.id === targetInstructorId);
      setReassignSuccessMsg(
        `Aluno "${studentToReassign.nome}" reatribuído com sucesso para o instrutor "${targetInstructor?.nome || ''}"!`
      );
      setStudentToReassign(null);
      setTargetInstructorId('');
      runIntegrityScan();
      setTimeout(() => setReassignSuccessMsg(''), 4500);
    }
  };

  const totalEcosystemRevenue = allPayments.reduce((acc, p) => acc + p.valorCentavos, 0);

  const handleResetData = () => {
    if (window.confirm('Deseja realmente redefinir o banco de dados para os dados padrão de demonstração?')) {
      db.resetDatabase();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1000);
    }
  };

  const instructorsList = allUsers.filter((u) => u.papel === 'ADMIN_ORG' || u.papel === 'INSTRUTOR');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white rounded-2xl p-6 shadow-xl border border-purple-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">
                Console Administrativo Master · Gestão Total
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Ambiente do Administrador Master
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Gestão centralizada da plataforma, banco de dados, contas de instrutores e verificação contínua de integridade dos cadastros de alunos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onSwitchUser('instrutor@autoescola.com')}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Acessar ambiente como Instrutor Carlos"
            >
              <Users className="w-4 h-4" />
              Simular Instrutor
            </button>
            <button
              onClick={() => onSwitchUser('aluno@teste.com.br')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Acessar ambiente como Aluno Pedro"
            >
              <GraduationCap className="w-4 h-4" />
              Simular Aluno
            </button>
          </div>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Banco de dados restaurado com sucesso!</span>
        </div>
      )}

      {reassignSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{reassignSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('VERIFICADOR')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'VERIFICADOR'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Verificador de Cadastros & Relações</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px]">
            {integrityReport.score}%
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ORGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ORGS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Instituições & CFCs ({organizations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MAINTENANCE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'MAINTENANCE'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Manutenção & Banco Demo</span>
        </button>
      </div>

      {/* TAB 1: VERIFICADOR DE CADASTROS & RELAÇÕES */}
      {activeSubTab === 'VERIFICADOR' && (
        <div className="space-y-6">
          {/* Header Card with Health Status and Scan Trigger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Auditoria de Integridade Referencial dos Cadastros
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Verifica se cada cadastro de instrutor possui seus alunos devidamente relacionados, sem alunos órfãos, conflitos de agenda ou inconsistências financeiras.
                </p>
              </div>

              <button
                onClick={runIntegrityScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Executando Varredura...' : 'Executar Varredura Agora'}</span>
              </button>
            </div>

            {/* Health Scorecard */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Pontuação Global
                </span>
                <p className="text-2xl font-black text-purple-900 font-mono mt-0.5">
                  {integrityReport.score}%
                </p>
                <span className="text-[10px] text-purple-700 font-medium">
                  {integrityReport.isAllConsistent ? '✓ 100% Homologado' : 'Avisos detectados'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Instrutores Ativos
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {integrityReport.totalInstructors}
                </p>
                <span className="text-[10px] text-slate-500">Credenciados Detran</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Alunos Vinculados
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {integrityReport.totalStudents}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">100% com CPF válido</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Alunos Órfãos
                </span>
                <p
                  className={`text-2xl font-black font-mono mt-0.5 ${
                    integrityReport.orphanStudents.length > 0 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {integrityReport.orphanStudents.length}
                </p>
                <span className="text-[10px] text-slate-500">
                  {integrityReport.orphanStudents.length === 0 ? '✓ Nenhum órfão' : 'Requer vinculação'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Conflitos de Agenda
                </span>
                <p
                  className={`text-2xl font-black font-mono mt-0.5 ${
                    integrityReport.scheduleConflicts.length > 0 ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {integrityReport.scheduleConflicts.length}
                </p>
                <span className="text-[10px] text-slate-500">
                  {integrityReport.scheduleConflicts.length === 0 ? '✓ Horários sem choque' : 'Choques na agenda'}
                </span>
              </div>
            </div>
          </div>

          {/* Orphan Students Alert Section if any */}
          {integrityReport.orphanStudents.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Alunos Detectados sem Instrutor Válido Vinculado</span>
              </div>
              <p className="text-xs text-red-800">
                Os seguintes alunos estão registrados no banco, mas não possuem um instrutor ativo associado. Utilize a ação ao lado para reatribuí-los imediatamente:
              </p>
              <div className="divide-y divide-red-200">
                {integrityReport.orphanStudents.map((orphan) => (
                  <div key={orphan.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{orphan.nome}</p>
                      <p className="text-[11px] text-slate-600 font-mono">
                        CPF: {orphan.cpfMascarado} · Email: {orphan.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setStudentToReassign(orphan)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Vincular a um Instrutor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search bar for verification filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Instrutores e seus Respectivos Alunos Vinculados
              </h3>
              <p className="text-xs text-slate-500">
                Clique no instrutor para inspecionar os alunos condicionados ao seu cadastro
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por instrutor, aluno ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Instructors and their bound students list */}
          <div className="space-y-4">
            {integrityReport.instructorRelations
              .filter(
                (rel) =>
                  rel.instructor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  rel.instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  rel.students.some(
                    (s) =>
                      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.cpfMascarado.includes(searchTerm)
                  )
              )
              .map((relation) => {
                const { instructor, students, studentsCount, activeLessonsCount, totalRevenueCentavos, pendingRevenueCentavos } =
                  relation;
                const isExpanded = expandedInstructorId === instructor.id || searchTerm.length > 0;

                return (
                  <div
                    key={instructor.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
                  >
                    {/* Instructor Summary Bar */}
                    <div
                      onClick={() => setExpandedInstructorId(isExpanded ? null : instructor.id)}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {instructor.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{instructor.nome}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                              {instructor.papel === 'ADMIN_ORG' ? 'Instrutor Diretor' : 'Instrutor Credenciado'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              Código: {instructor.id.replace('usr_', '').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                            {instructor.email} · Tel: {instructor.telefone || 'Não informado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="flex items-center gap-2 text-right">
                          <div className="bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                            <span className="text-[10px] text-purple-700 font-semibold block">Alunos Vinculados</span>
                            <span className="font-mono font-black text-sm text-purple-900">{studentsCount}</span>
                          </div>
                          <div className="bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            <span className="text-[10px] text-blue-700 font-semibold block">Aulas na Agenda</span>
                            <span className="font-mono font-black text-sm text-blue-900">{activeLessonsCount}</span>
                          </div>
                          <div className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hidden sm:block">
                            <span className="text-[10px] text-emerald-700 font-semibold block">Recebido</span>
                            <span className="font-mono font-black text-xs text-emerald-900">
                              {formatCurrencyBRL(totalRevenueCentavos)}
                            </span>
                          </div>
                        </div>

                        <button className="text-slate-400 p-1 rounded-lg">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Students Table */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            <span>Alunos Condicionados a este Instrutor ({students.length})</span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Regra: 1 aluno (CPF) por instrutor
                          </span>
                        </div>

                        {students.length === 0 ? (
                          <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                            Nenhum aluno vinculado a este instrutor no momento.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2.5">
                            {students.map((student) => (
                              <div
                                key={student.id}
                                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 text-xs">{student.nome}</span>
                                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                                      CNH {student.categoriaCnh}
                                    </span>
                                    <span className="px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Vínculo Confirmado
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-mono">
                                    <span>CPF: {student.cpfMascarado}</span>
                                    <span>Email: {student.email}</span>
                                    <span>Tel: {student.telefone}</span>
                                    <span>Aulas: {student.aulasCumpridas}/{student.totalAulasContratadas}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                  <div className="text-right sm:mr-2">
                                    <span className="text-[10px] text-slate-400 block font-medium">Plano</span>
                                    <span className="text-xs font-bold text-slate-800">
                                      {student.pacoteNome || 'Plano Padrão 20 Aulas'}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => setStudentToReassign(student)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                    title="Transferir ou reatribuir aluno para outro instrutor"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Reatribuir</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZAÇÕES & CFCS */}
      {activeSubTab === 'ORGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Instituições e Autoescolas Cadastradas</h2>
              <p className="text-xs text-slate-500">Isolamento completo de dados por tenant</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar por nome ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Nome da Organização</th>
                  <th className="py-2.5 px-3">Modalidade</th>
                  <th className="py-2.5 px-3">Cidade / UF</th>
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {organizations
                  .filter((o) => o.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {org.nome}
                        <span className="block text-[10px] text-slate-400 font-mono">{org.cnpjCpf}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {org.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {org.cidade} / {org.estado}
                      </td>
                      <td className="py-3 px-3 font-semibold text-purple-700">{org.plano}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSwitchUser('instrutor@autoescola.com')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Acessar Painel
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MAINTENANCE */}
      {activeSubTab === 'MAINTENANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              Manutenção de Dados & Reset de Demonstração
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Restaura todos os pacotes, instrutores e alunos teste (incluindo o Administrador Cássio Costa `cassiordcosta@gmail.com`) para o estado padrão homologado.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Banco de Dados Demo
          </button>
        </div>
      )}

      {/* Modal de Reatribuição Administrativa de Aluno */}
      {studentToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Reatribuição de Aluno</h3>
                  <p className="text-[11px] text-slate-500">Ação exclusiva do Administrador Master</p>
                </div>
              </div>
              <button
                onClick={() => setStudentToReassign(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-purple-900">Aluno Selecionado:</p>
              <p className="text-slate-800 font-semibold">{studentToReassign.nome}</p>
              <p className="text-[11px] text-slate-600 font-mono">
                CPF: {studentToReassign.cpfMascarado} · CNH {studentToReassign.categoriaCnh}
              </p>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecione o Novo Instrutor Responsável *
                </label>
                <select
                  required
                  value={targetInstructorId}
                  onChange={(e) => setTargetInstructorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-purple-600 focus:outline-none text-xs bg-white"
                >
                  <option value="">Selecione um instrutor credenciado...</option>
                  {instructorsList.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.nome} ({ins.email})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  A reatribuição atualizará o vínculo do CPF, as agendas e gravará log de auditoria permanente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStudentToReassign(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!targetInstructorId}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Confirmar Vínculo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
