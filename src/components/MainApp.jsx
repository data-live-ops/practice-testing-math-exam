import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase.js';

const SOUND_URLS = {
    success: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/456969-funwithsound-success-resolution-video-game-fanfare-sound-effect-with-dr_eXQvC7YB.mp3',
    error: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/327735__distillerystudio__error_04.wav',
    click: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/421458__jaszunio15__click_195.wav',
    finish: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/751134__audiocoffee__success-every-day-short-ver.wav',
};

const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) throw (error);

    return data;
};

const getAllQuestions = async () => {
    const { data, error } = await supabase
        .from('questions')
        .select('*');

    if (error) throw (error);

    return data;
};

const createUserSession = async (userId) => {
    const { data, error } = await supabase
        .from('user_sessions')
        .insert({
            user_id: userId,
            start_time: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

const updateUserSession = async (sessionId, updates) => {
    const { data, error } = await supabase
        .from('user_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

const MathExamApp = () => {
    const [currentPage, setCurrentPage] = useState('login');
    const [user, setUser] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState({});
    const [attempts, setAttempts] = useState({});
    const [timeTracking, setTimeTracking] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({});
    const [modalType, setModalType] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loginError, setLoginError] = useState('');
    const [hoveredOption, setHoveredOption] = useState(null);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [userSession, setUserSession] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [assetsLoaded, setAssetsLoaded] = useState(false);


    const startTimeRef = useRef(null);
    const currentQuestionRef = useRef(currentQuestion);

    useEffect(() => {
        const preloadAssets = async () => {
            const soundPromises = Object.values(SOUND_URLS).map(url => {
                return new Promise((resolve) => {
                    const audio = new Audio(url);
                    audio.addEventListener('canplaythrough', resolve);
                    audio.addEventListener('error', resolve);
                    audio.load();
                });
            });

            const imageUrls = [
                'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Deck-coco-happy-right.png',
                'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Neco-lazy.png',
                'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Coco-neco-pencil-rocket.png',
                'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Leo-caca-nara-hello-colearn-t-shirt.png',
                'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Coco-head-wink.png',
                'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/partner%20asset-leo%20caca%20nara.png'
            ];

            const imagePromises = imageUrls.map(url => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = url;
                });
            });

            await Promise.all([...soundPromises, ...imagePromises]);
            setAssetsLoaded(true);
        };

        preloadAssets();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const usersData = await getAllUsers();
            setUsers(usersData);

            const questionsData = await getAllQuestions();
            setQuestions(questionsData);
        }

        fetchData();
    }, []);

    useEffect(() => {
        currentQuestionRef.current = currentQuestion;

    }, [currentQuestion]);

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        },
        loginPage: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        loginForm: {
            display: 'flex',
            flexDirection: 'column',
            padding: '40px',
            textAlign: 'center',
            width: '400px',
        },
        welcomePage: {
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        examPage: {
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            minHeight: '80vh'
        },
        completePage: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            minHeight: '80vh',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px'
        },
        scoreTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2196F3',
            marginRight: '10px'
        },
        score: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2196F3',
            width: '150px',
            textAlign: 'center',
            padding: '10px',
            border: '2px solid #1e6eb0ff'
        },
        mainContent: {
            display: 'flex',
            gap: '20px',
            marginTop: '20px'
        },
        sidebar: {
            flex: '0 0 200px'
        },
        questionArea: {
            flex: '1',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa'
        },
        questionButtons: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(10, 1fr)',
            gap: '10px',
            marginBottom: '20px'
        },
        questionButton: {
            padding: '12px',
            border: 'none',
            width: '100%',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s'
        },
        finishButton: {
            gridColumn: 'span 2',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '15px',
            marginTop: '10px'
        },
        options: {
            display: 'grid',
            gap: '10px',
            marginTop: '20px'
        },
        optionButton: {
            padding: '15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '16px',
            backgroundColor: 'white',
            transition: 'all 0.3s'
        },
        input: {
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            boxSizing: 'border-box'
        },
        select: {
            width: '100%',
            padding: '12px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
        },
        button: {
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '10px 5px',
            transition: 'all 0.3s'
        },
        primaryButton: {
            backgroundColor: '#2196F3',
            color: 'white'
        },
        modal: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
        },
        error: {
            color: '#f44336',
            fontSize: '14px',
            marginTop: '10px'
        }
    };

    const playSound = (soundType) => {
        if (!audioEnabled) return;

        try {
            const audio = new Audio(SOUND_URLS[soundType]);
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.log('Audio play failed:', error);
            });
        } catch (error) {
            console.log('Audio creation failed:', error);
        }
    };

    const handleLogin = async () => {
        const selectedUser = users.find(u => u.name === selectedName);
        if (!selectedUser || selectedUser.id !== inputCode) {
            setLoginError('Nama dan kode tidak cocok!');
            return;
        }
        try {
            const session = await createUserSession(selectedUser.id);
            setUserSession(session);
            setUser(selectedUser);
            setLoginError('');
            setCurrentPage('welcome');
        } catch (error) {
            console.error('Error creating session:', error);
            setLoginError('Terjadi kesalahan saat login');
        }
    };

    const startExam = () => {
        setCurrentPage('exam');
        startQuestionTimer(1);
    };

    const startQuestionTimer = (questionId) => {
        const now = Date.now();
        setTimeTracking(prev => {
            const currentTracking = prev[questionId] || { totalTime: 0, sessions: [] };

            return {
                ...prev,
                [questionId]: {
                    ...currentTracking,
                    currentStartTime: now,
                    lastActivity: now
                }
            };
        });
        startTimeRef.current = now;
    };

    const stopQuestionTimer = (questionId) => {
        if (startTimeRef.current) {
            const now = Date.now();
            const timeSpent = now - startTimeRef.current;

            setTimeTracking(prev => {
                const currentTracking = prev[questionId] || { totalTime: 0, sessions: [] };
                const newSessions = [...(currentTracking.sessions || [])];

                newSessions.push({
                    startTime: startTimeRef.current,
                    endTime: now,
                    duration: timeSpent
                });

                return {
                    ...prev,
                    [questionId]: {
                        ...currentTracking,
                        totalTime: (currentTracking.totalTime || 0) + timeSpent,
                        sessions: newSessions,
                        lastEndTime: now,
                        currentStartTime: null
                    }
                };
            });
            startTimeRef.current = null;
        }
    };

    const switchQuestion = (questionId) => {
        if (currentQuestion !== questionId) {
            playSound('click');
            stopQuestionTimer(currentQuestion);
            setCurrentQuestion(questionId);
            startQuestionTimer(questionId);
        }
    };

    const getQuestionButtonColor = (questionId) => {
        const answer = answers[questionId];
        if (answer === undefined) return '#e0e0e0';
        if (answer.isCorrect) return '#4CAF50';
        return '#f44336';
    };

    const handleAnswerSelect = async (optionIndex) => {
        const question = questions.find(q => q.id === currentQuestion);
        const isCorrect = optionIndex === question.correct_answer;
        console.log(`cek jawaban: ${isCorrect}\nindex: ${optionIndex} dengan ${question.correct_answer}`)
        const currentAttempts = attempts[currentQuestion] || 0;
        const pointsPerCorrect = user.experimental_code === 'A' ? 10 : 1;
        let newScore = score;

        if (isCorrect) {
            playSound('success');
            newScore = score + pointsPerCorrect;
            setAnswers(prev => ({
                ...prev,
                [currentQuestion]: { optionIndex, isCorrect: true, attempts: currentAttempts + 1 }
            }));

            setScore(newScore);
            stopQuestionTimer(currentQuestion);

            setModalContent({
                image: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Deck-coco-happy-right.png',
                desc: `Jawaban kamu benar! Selamat kamu mendapatkan ${pointsPerCorrect} poin!`
            })
            setModalType('success');
            setShowModal(true);
        } else {
            playSound('error');
            const newAttempts = currentAttempts + 1;
            setAttempts(prev => ({ ...prev, [currentQuestion]: newAttempts }));

            if (newAttempts === 1) {
                setModalContent({
                    image: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Neco-lazy.png',
                    desc: 'Yah jawaban kamu kurang tepat. Coba sekali lagi yuk!'
                });
                setModalType('retry');
                setShowModal(true);
            } else {
                setAnswers(prev => ({
                    ...prev,
                    [currentQuestion]: { optionIndex, isCorrect: false, attempts: 2 }
                }));

                stopQuestionTimer(currentQuestion);
                setModalContent({
                    image: 'https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Coco-neco-pencil-rocket.png',
                    desc: 'Jawaban kamu masih kurang tepat, tapi kamu tetap hebat kok. Coba soal berikutnya yuk!'
                });
                setModalType('failed');
                setShowModal(true);
            }
        }

        if (userSession) {
            try {
                await updateUserSession(userSession.id, {
                    score: newScore,
                    answers: { ...answers, [currentQuestion]: { optionIndex, isCorrect, attempts: currentAttempts + 1 } },
                    time_tracking: timeTracking
                });
            } catch (error) {
                console.error('Error updating session:', error);
            }
        }
    };


    const closeModal = () => {
        setShowModal(false);
        setModalContent('');
        setModalType('');
    };

    const finishExam = () => {
        setModalContent('Kamu yakin mau mengakhiri sesi?');
        setModalType('confirm');
        setShowModal(true);
    };

    const confirmFinish = async () => {
        playSound('finish');
        stopQuestionTimer(currentQuestion);

        if (userSession) {
            try {
                await updateUserSession(userSession.id, {
                    end_time: new Date().toISOString(),
                    score: score,
                    answers: answers,
                    time_tracking: timeTracking
                });
            } catch (error) {
                console.error('Error saving final session:', error);
            }
        }

        setCurrentPage('complete');
        closeModal();
    };

    useEffect(() => {
        if (!userSession || currentPage !== 'exam') return;

        const autoSaveInterval = setInterval(async () => {
            try {
                await updateUserSession(userSession.id, {
                    score: score,
                    answers: answers,
                    time_tracking: timeTracking
                });
                console.log('Auto-saved session data');
            } catch (error) {
                console.error('Error auto-saving session:', error);
            }
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [userSession, currentPage, score, answers, timeTracking]);

    useEffect(() => {
        return () => {
            if (startTimeRef.current && currentQuestionRef.current) {
                stopQuestionTimer(currentQuestionRef.current);
            }
        };
    }, []);

    const renderAudioToggle = () => (
        <button
            style={{
                ...styles.button,
                backgroundColor: audioEnabled ? '#4CAF50' : '#f44336',
                color: 'white',
                padding: '8px 16px',
                fontSize: '14px',
                margin: '0 10px'
            }}
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
        >
            {audioEnabled ? '🔊' : '🔇'} {audioEnabled ? 'ON' : 'OFF'}
        </button>
    );

    const renderLoginPage = () => (
        <div style={styles.loginPage}>
            <div style={styles.loginForm}>
                <h1>Login Ujian Matematika</h1>
                <select
                    style={styles.select}
                    value={selectedName}
                    onChange={(e) => setSelectedName(e.target.value)}
                >
                    <option value="">Pilih Nama Anda</option>
                    {users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                </select>

                <input
                    type="text"
                    style={styles.input}
                    placeholder="Masukkan Kode"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                />

                {loginError && <div style={styles.error}>{loginError}</div>}

                <button
                    style={{ ...styles.button, ...styles.primaryButton }}
                    onClick={handleLogin}
                >
                    Masuk
                </button>
            </div>
        </div>
    );

    const renderWelcomePage = () => (
        <div style={styles.welcomePage}>
            <div style={{ display: 'flex' }}>
                <div style={{ paddingRight: '100px' }}>
                    <h1>Selamat Datang, {user.name}!</h1>
                    <h3>Terimakasih sudah bersedia untuk berpartisipasi di uji coba pengembangan fitur latihan aplikasi CoLearn.</h3>
                </div>
                <img src="https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Leo-caca-nara-hello-colearn-t-shirt.png" alt="introduction" width={300} />
            </div>
            <div style={{ marginTop: '30px', lineHeight: '1.8' }}>
                <p>Berikut beberapa panduan untuk mengerjakan soal latihan hari ini:</p>
                <ol style={{ textAlign: 'left', margin: '20px auto' }}>
                    <li>Terdapat 10 soal pilihan ganda, kalian boleh mengerjakan secara berurutan ataupun acak</li>
                    <li>Untuk setiap soal yang kalian jawab benar, kalian akan mendapatkan <strong>{user.experimental_code === 'A' ? '10 poin' : '1 poin'}</strong></li>
                    <li>Kalian memiliki 2 kali kesempatan untuk menjawab dengan benar pada masing-masing soal</li>
                    <li>Tidak ada pengurangan poin jika jawabanmu salah</li>
                    <li>Jika sudah menjawab semua soal, silahkan klik tombol selesai</li>
                    <li>Jika ada pertanyaan, silahkan angkat tangan</li>
                </ol>
            </div>
            <button
                style={{ ...styles.button, ...styles.primaryButton, marginTop: '30px' }}
                onClick={startExam}
            >
                Mulai Ujian
            </button>
        </div>
    );

    const renderExamPage = () => {
        const currentQuestionData = questions.find(q => q.id === currentQuestion);
        const currentAnswer = answers[currentQuestion];
        const currentAttempts = attempts[currentQuestion] || 0;
        const canAnswer = !currentAnswer && currentAttempts < 2;

        return (
            <div style={styles.examPage}>
                <div style={styles.header}>
                    <h2>Halaman Soal</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {renderAudioToggle()}
                        <img src="https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/Coco-head-wink.png" alt="coc-score" width={50} />
                        <div style={styles.scoreTitle}>Skor Sementara:</div>
                        <div style={styles.score}>{score}</div>
                    </div>
                </div>

                <div style={styles.mainContent}>
                    <div style={styles.sidebar}>
                        <div style={styles.questionButtons}>
                            {Array.from({ length: 10 }, (_, i) => (
                                <button
                                    key={i + 1}
                                    style={{
                                        ...styles.questionButton,
                                        backgroundColor: getQuestionButtonColor(i + 1),
                                        color: getQuestionButtonColor(i + 1) === '#e0e0e0' ? '#333' : 'white',
                                        border: currentQuestion === i + 1 ? '3px solid #333' : 'none',
                                        gridColumn: (i % 2) + 1,
                                        gridRow: Math.floor(i / 2) + 1
                                    }}
                                    onClick={() => switchQuestion(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                style={{ ...styles.questionButton, ...styles.finishButton }}
                                onClick={finishExam}
                            >
                                Selesai
                            </button>
                        </div>
                    </div>

                    <div style={styles.questionArea}>
                        <h3>Soal {currentQuestion}</h3>
                        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                            {currentQuestionData.question}
                        </p>

                        {currentQuestionData.attachment && (
                            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
                                <img src={currentQuestionData.attachment} width={400} />
                            </div>
                        )}

                        <div style={styles.options}>
                            {currentQuestionData.options.map((option, index) => (
                                <button
                                    key={index}
                                    style={{
                                        ...styles.optionButton,
                                        backgroundColor: hoveredOption === index
                                            ? '#e3f2fd'
                                            : (canAnswer ? 'white' : '#f5f5f5'),
                                        cursor: canAnswer ? 'pointer' : 'not-allowed',
                                        borderColor: currentAnswer?.optionIndex === index ? '#2196F3' : '#ddd'
                                    }}
                                    onClick={() => canAnswer && handleAnswerSelect(index)}
                                    disabled={!canAnswer}
                                    onMouseEnter={() => setHoveredOption(index)}
                                    onMouseLeave={() => setHoveredOption(null)}
                                >
                                    {String.fromCharCode(65 + index)}. {option}
                                </button>
                            ))}
                        </div>

                        {currentAttempts > 0 && !currentAnswer && (
                            <p style={{ marginTop: '20px', color: '#f44336' }}>
                                Kesempatan tersisa: {2 - currentAttempts}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCompletePage = () => (
        <div style={styles.completePage}>
            <div>
                <h1>Selamat!</h1>
                <p style={{ fontSize: '20px', margin: '20px 0' }}>
                    Kamu sudah berhasil menyelesaikan semua soal dengan baik.
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                    Total poin kamu: {score} poin
                </p>
                <img src="https://vqhaeqcorxsizfiswphs.supabase.co/storage/v1/object/public/practice_exam/partner%20asset-leo%20caca%20nara.png" alt="congrats" width={700} />
            </div>
        </div>
    );

    const renderModal = () => (
        showModal && (
            <div style={styles.modal}>
                <div style={styles.modalContent}>
                    <img src={modalContent.image} width={200} />
                    <p style={{ fontSize: '18px', marginBottom: '20px' }}>{modalContent?.desc}</p>
                    {modalType === 'confirm' ? (
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.3rem', marginBottom: '10px' }}>Kamu yakin mau mengakhiri sesi?</div>
                            <button
                                style={{ ...styles.button, backgroundColor: '#4CAF50', color: 'white' }}
                                onClick={confirmFinish}
                            >
                                Ya, Selesai
                            </button>
                            <button
                                style={{ ...styles.button, backgroundColor: '#f44336', color: 'white' }}
                                onClick={closeModal}
                            >
                                Batal
                            </button>
                        </div>
                    ) : (
                        <button
                            style={{ ...styles.button, ...styles.primaryButton }}
                            onClick={closeModal}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        )
    );

    if (!assetsLoaded) {
        return (
            <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div>Loading dulu....</div>
                    <div style={{ marginTop: '10px' }}>📱💫</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {currentPage === 'login' && renderLoginPage()}
            {currentPage === 'welcome' && renderWelcomePage()}
            {currentPage === 'exam' && renderExamPage()}
            {currentPage === 'complete' && renderCompletePage()}
            {renderModal()}
        </div>
    );
};

export default MathExamApp;