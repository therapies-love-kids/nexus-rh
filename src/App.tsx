import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout, { LayoutDash } from './Layout';
import { StylePage, Login, Inicio, Profissionais, NovoProfissional, PrimeirosPassos, ProfissionaisDemitidos, EditarProfissional, Unidades, UnidadesNova, UnidadesInativas, EditarUnidade, Empresas, EmpresasNova, EmpresasInativas, EditarEmpresa } from './pages';
import { Suspense } from 'react';
import MacErro from './pages/Login/MacErro';
import { PrivateRoute } from './components';  // Importando o PrivateRoute

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

export default function App() {
    return (
        <div className='App APPCONTEUDO w-full flex max-h-[100vh] overflow-clip'>
            <Router>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        {/* Rota de Login */}
                        <Route path="/" element={<Layout><Login /></Layout>} />

                        {/* Página de estilos (temporário) */}
                        <Route path="/style" element={<Layout><StylePage /></Layout>} />

                        {/* Primeiros Passos */}
                        <Route path="/primeiros-passos/:id" element={<Layout><PrimeirosPassos /></Layout>} />

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

                            <Route path="/profissionais/:id" element={
                                <PrivateRoute>
                                    <LayoutDash><EditarProfissional /></LayoutDash>
                                </PrivateRoute>
                            } />

                            <Route path="/profissionais/novo" element={
                                <PrivateRoute>
                                    <LayoutDash><NovoProfissional /></LayoutDash>
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

                            <Route path="/unidades/:id" element={
                                <PrivateRoute>
                                    <LayoutDash><EditarUnidade /></LayoutDash>
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

                            <Route path="/empresas/:id" element={
                                <PrivateRoute>
                                    <LayoutDash><EditarEmpresa /></LayoutDash>
                                </PrivateRoute>
                            } />

                        </>
                        
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}
