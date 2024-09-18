import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout, { LayoutDash } from './Layout';
import { StylePage, Login, Inicio, Profissionais, NovoProfissional, PrimeirosPassos, ProfissionaisDemitidos, EditarProfissional } from './pages';
import { Suspense } from 'react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import MacErro from './pages/Login/MacErro';

export default function App() {
    // const faultyVariable = null;
    return (
        <div className='App APPCONTEUDO w-full flex max-h-[100vh] overflow-clip'>
            {/* DESCONSIDERAR <div>{faultyVariable.someProperty}</div> */}
            <Router>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>

                        {/* LEMBRAR DE CORRIGIR OS LINKS */}

                        <Route
                            path="/"
                            element={
                                <Layout>
                                    <Login />
                                </Layout>
                            }
                        />

                        <Route
                            path="/primeiros-passos/:id"
                            element={
                                <Layout>
                                    <PrimeirosPassos />
                                </Layout>
                            }
                        />

                        <Route
                            path="/mac-erro"
                            element={
                                <Layout>
                                    <MacErro />
                                </Layout>
                            }
                        />

                        <Route path="/dashboard" element={
                            <LayoutDash>
                                <Inicio />
                            </LayoutDash>
                        } />

                        <Route path="/profissionais" element={
                            <LayoutDash>
                                <Profissionais />
                            </LayoutDash>
                        } />

                        <Route path="/profissionais/demitidos" element={
                            <LayoutDash>
                                <ProfissionaisDemitidos />
                            </LayoutDash>
                        } />

                        <Route path="/profissionais/editar/:id" element={
                            <LayoutDash>
                                <EditarProfissional />
                            </LayoutDash>
                        } />

                        <Route path="/profissionais/novo" element={
                            <LayoutDash>
                                <NovoProfissional />
                            </LayoutDash>
                        } />

                        {/* LEMBRAR DE CORRIGIR OS LINKS */}

                        {/* TEMPORÁRIO */}
                        <Route
                            path="/style"
                            element={
                                <Layout>
                                    <StylePage />
                                </Layout>
                            }
                        />
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}