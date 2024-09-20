import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout, { LayoutDash } from './Layout';
import { StylePage, Login, Inicio, Profissionais, NovoProfissional, PrimeirosPassos, ProfissionaisDemitidos, EditarProfissional, Unidades, UnidadesNovo, UnidadesInativas, EditarUnidade } from './pages';
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

                        {/* Primeiros Passos */}
                        <Route path="/primeiros-passos/:id" element={<Layout><PrimeirosPassos /></Layout>} />

                        {/* Erro de MAC */}
                        <Route path="/mac-erro" element={<Layout><MacErro /></Layout>} />

                        {/* Rotas protegidas */}
                        <Route path="/inicio" element={
                            <PrivateRoute>
                                <LayoutDash><Inicio /></LayoutDash>
                            </PrivateRoute>
                        } />


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

                            <Route path="/profissionais/editar/:id" element={
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

                        <Route path="/unidades" element={
                            <PrivateRoute>
                                <LayoutDash><Unidades /></LayoutDash>
                            </PrivateRoute>
                        } />

                        <Route path="/unidades/inativas" element={
                            <PrivateRoute>
                                <LayoutDash><UnidadesInativas /></LayoutDash>
                            </PrivateRoute>
                        } />

                        <Route path="/unidades/novo" element={
                            <PrivateRoute>
                                <LayoutDash><UnidadesNovo /></LayoutDash>
                            </PrivateRoute>
                        } />

                        <Route path="/unidades/editar/:id" element={
                            <PrivateRoute>
                                <LayoutDash><EditarUnidade /></LayoutDash>
                            </PrivateRoute>
                        } />

                        {/* Página de estilos (temporário) */}
                        <Route path="/style" element={<Layout><StylePage /></Layout>} />
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}
