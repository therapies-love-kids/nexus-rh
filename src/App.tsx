import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout, { LayoutDash, LayoutDashTrans } from './Layout';
import {
        Login,
        Inicio,
        Profissionais,
        ProfissionaisNovo,
        PrimeirosPassos,
        ProfissionaisDemitidos,
        ProfissionaisEditar,
        Unidades,
        UnidadesNova,
        UnidadesInativas,
        UnidadesEditar,
        Empresas,
        EmpresasNova,
        EmpresasInativas,
        EmpresasEditar,
        Departamentos,
        DepartamentosNovo,
        DepartamentosInativos,
        DepartamentosEditar,
        Funcoes,
        FuncoesNova,
        FuncoesInativos,
        FuncoesEditar,
        Social,
        SocialMeuPerfil,
        SocialEditarMeuPerfil,
        SocialTarefas,
    } from './pages';
import { Suspense } from 'react';
import MacErro from './pages/Login/MacErro';
import { PrivateRoute } from './components';  // Importando o PrivateRoute

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import './main.scss';

export default function App() {
    return (
        <div className='App APPCONTEUDO w-full flex max-h-[100vh] overflow-clip'>
            <Router>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        {/* Rota de Login */}
                        <Route path="/" element={<Layout><Login /></Layout>} />

                        {/* Primeiros Passos */}
                        <Route path="/primeiros-passos/:profissional_id" element={<Layout><PrimeirosPassos /></Layout>} />

                        {/* Erro de MAC */}
                        <Route path="/mac-erro" element={<Layout><MacErro /></Layout>} />

                        {/* PÁGINA INICIAL */}
                        <Route path="/inicio" element={
                            <PrivateRoute>
                                <LayoutDash><Inicio /></LayoutDash>
                            </PrivateRoute>
                        } />

                        {/* PROFISSIONAIS */}
                        <>
                            <Route path="/profissionais" element={
                                <PrivateRoute>
                                    <LayoutDash><Profissionais /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/profissionais/demitidos" element={
                                <PrivateRoute>
                                    <LayoutDash><ProfissionaisDemitidos /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/profissionais/novo" element={
                                <PrivateRoute>
                                    <LayoutDash><ProfissionaisNovo /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/profissionais/:profissional_id" element={
                                <PrivateRoute>
                                    <LayoutDash><ProfissionaisEditar /></LayoutDash>
                                </PrivateRoute>
                            } />
                        </>

                        {/* UNIDADES */}
                        <>
                            <Route path="/unidades" element={
                                <PrivateRoute>
                                    <LayoutDash><Unidades /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/unidades/nova" element={
                                <PrivateRoute>
                                    <LayoutDash><UnidadesNova /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/unidades/inativas" element={
                                <PrivateRoute>
                                    <LayoutDash><UnidadesInativas /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/unidades/:unidade_id" element={
                                <PrivateRoute>
                                    <LayoutDash><UnidadesEditar /></LayoutDash>
                                </PrivateRoute>
                            } />
                        </>

                        {/* EMPRESAS */}
                        <>
                            <Route path="/empresas" element={
                                <PrivateRoute>
                                    <LayoutDash><Empresas /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/empresas/nova" element={
                                <PrivateRoute>
                                    <LayoutDash><EmpresasNova /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/empresas/inativas" element={
                                <PrivateRoute>
                                    <LayoutDash><EmpresasInativas /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/empresas/:empresa_id" element={
                                <PrivateRoute>
                                    <LayoutDash><EmpresasEditar /></LayoutDash>
                                </PrivateRoute>
                            } />

                        </>

                        {/* DEPARTAMENTOS */}
                        <>
                            <Route path="/departamentos" element={
                                <PrivateRoute>
                                    <LayoutDash><Departamentos /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/departamentos/novo" element={
                                <PrivateRoute>
                                    <LayoutDash><DepartamentosNovo /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/departamentos/inativos" element={
                                <PrivateRoute>
                                    <LayoutDash><DepartamentosInativos /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/departamentos/:departamento_id" element={
                                <PrivateRoute>
                                    <LayoutDash><DepartamentosEditar /></LayoutDash>
                                </PrivateRoute>
                            } />

                        </>

                        {/* FUNÇÕES */}
                        <>
                            <Route path="/funcoes" element={
                                <PrivateRoute>
                                    <LayoutDash><Funcoes /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/funcoes/nova" element={
                                <PrivateRoute>
                                    <LayoutDash><FuncoesNova /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/funcoes/inativos" element={
                                <PrivateRoute>
                                    <LayoutDash><FuncoesInativos /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/funcoes/:funcao_id" element={
                                <PrivateRoute>
                                    <LayoutDash><FuncoesEditar /></LayoutDash>
                                </PrivateRoute>
                            } />

                        </>

                        {/* SOCIAL */}
                        <>
                            <Route path="/social" element={
                                <PrivateRoute>
                                    <LayoutDashTrans><Social /></LayoutDashTrans>
                                </PrivateRoute>
                            } />
                            {/* PERFIL */}
                            <>
                                <Route path="/social/perfil" element={
                                    <PrivateRoute>
                                        <LayoutDashTrans><SocialMeuPerfil /></LayoutDashTrans>
                                    </PrivateRoute>
                                } />
                                <Route path="/social/perfil/editar" element={
                                    <PrivateRoute>
                                        <LayoutDashTrans><SocialEditarMeuPerfil /></LayoutDashTrans>
                                    </PrivateRoute>
                                } />
                            </>
                            {/* TAREFAS */}
                            <>
                                <Route path="/social/tarefas" element={
                                    <PrivateRoute>
                                        <LayoutDashTrans><SocialTarefas /></LayoutDashTrans>
                                    </PrivateRoute>
                                } />
                            </>
                        </>

                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}
