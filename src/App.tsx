import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout, { LayoutDash } from './Layout';
import { StylePage, Login, Inicio, Profissionais, NovoProfissional } from './pages';
import { Suspense } from 'react';

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
                            path="/login"
                            element={
                                <Layout>
                                    <Login />
                                </Layout>
                            }
                        />
                        <Route path="/inicio" element={
                            <LayoutDash>
                                <Inicio />
                            </LayoutDash>
                        } />
                        <Route path="/profissionais" element={
                            <LayoutDash>
                                <Profissionais />
                            </LayoutDash>
                        } />

                        <Route path="/" element={
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