import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './supabase';
import { BookOpen, CheckCircle, XCircle, Plus, Trash2, User, GraduationCap, ChevronRight, Save, RefreshCcw, LogOut, UserPlus, UserCheck, Users, ShieldAlert, Wand2, Calendar, Clock, AlertTriangle, Filter, BarChart2, ArrowLeft, AlertOctagon, Star, Trophy, Gift, PlusCircle, MinusCircle, Settings, Edit3, RotateCcw } from 'lucide-react';

// --- Constants ---
const CHARACTERS = [
  { name: '알', icon: '🥚', minPoints: 0 },
  { name: '병아리', icon: '🐥', minPoints: 10 },
  { name: '햄스터', icon: '🐹', minPoints: 20 },
  { name: '고슴도치', icon: '🦔', minPoints: 30 },
  { name: '토끼', icon: '🐰', minPoints: 40 },
  { name: '고양이', icon: '🐱', minPoints: 50 },
  { name: '강아지', icon: '🐶', minPoints: 60 },
  { name: '거북이', icon: '🐢', minPoints: 70 },
  { name: '여우', icon: '🦊', minPoints: 80 },
  { name: '판다', icon: '🐼', minPoints: 90 },
  { name: '호랑이', icon: '🐯', minPoints: 100 },
  { name: '사자', icon: '🦁', minPoints: 110 },
  { name: '유니콘', icon: '🦄', minPoints: 120 },
  { name: '공룡', icon: '🦖', minPoints: 130 },
  { name: '용', icon: '🐉', minPoints: 140 },
];

// --- 1. Basic UI & Helper Components ---

const ResultView = ({ result, onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto overflow-hidden animate-fade-in-up">
      <div className="bg-slate-800 text-white px-8 py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">채점 결과</h2>
        <div className="flex justify-center items-end gap-2 mt-4">
          <span className="text-6xl font-extrabold text-yellow-400">{result.score}</span>
          <span className="text-xl text-gray-400 mb-2">/ {result.maxScore}점</span>
        </div>
        {result.isLate && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">
              지각 제출됨
            </span>
            {result.penaltyApplied > 0 && (
              <span className="text-red-300 text-xs animate-pulse">
                (벌점 {result.penaltyApplied}점 부과)
              </span>
            )}
          </div>
        )}
        {result.rewardEarned > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/50">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-spin-slow" />
            <span className="text-yellow-400 font-bold">상점 +{result.rewardEarned}점 획득!</span>
          </div>
        )}
      </div>

      <div className="p-8 space-y-8">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">상세 풀이</h3>

        {result.results.map((r, index) => (
          <div key={index} className={`p-4 rounded-xl border ${r.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`font-bold px-2 py-1 rounded text-sm ${r.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                문제 {index + 1}
              </span>
              {r.isCorrect ? (
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <CheckCircle className="w-5 h-5" /> 정답
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500 font-bold">
                  <XCircle className="w-5 h-5" /> 오답
                </div>
              )}
            </div>

            <div className="ml-2 space-y-2 mt-3 text-sm">
              <div className="flex gap-2">
                <span className="w-20 text-gray-500">나의 답안:</span>
                <span className={`font-medium ${r.isCorrect ? 'text-gray-800' : 'text-red-600 line-through'}`}>
                  {r.studentAnswer || '(미제출)'}
                </span>
              </div>
              {!r.isCorrect && (
                <div className="flex gap-2 animate-pulse">
                  <span className="w-20 text-gray-500">정답:</span>
                  <span className="font-bold text-blue-600">{r.correctAnswer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 px-6 py-4 flex justify-center">
        <button
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" /> 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

const AssignmentPlayer = ({ assignment, onBack, onComplete }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < assignment.questions.length) {
      if (!window.confirm('아직 풀지 않은 문제가 있습니다. 그래도 제출하시겠습니까?')) return;
    }
    onComplete(answers);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{assignment.title}</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm">나가기</button>
      </div>

      <div className="p-8 space-y-8">
        {assignment.questions.map((q, index) => (
          <div key={q.id} className="space-y-4">
            <div className="flex gap-2">
              <span className="bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded text-sm h-fit">Q{index + 1}</span>
              <div className="flex-1">
                <p className="text-lg text-gray-900 font-medium mb-1">{q.text}</p>
              </div>
            </div>

            <div className="pl-10">
              {q.type === 'short' ? (
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="답안을 입력하세요"
                />
              ) : (
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[q.id] === opt
                      ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                      : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transform active:scale-95 transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" /> 제출 및 채점하기
        </button>
      </div>
    </div>
  );
};

const CreateAssignmentForm = ({ classes, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [targetClass, setTargetClass] = useState(classes[0] || '전체');
  const [dueDate, setDueDate] = useState('');
  const [excellentScore, setExcellentScore] = useState(0);
  const [questions, setQuestions] = useState([]);

  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q${Date.now()}`,
        text: '',
        type: 'choice',
        options: ['', '', '', '', ''],
        correctAnswer: '',
        score: 10
      }
    ]);
  };

  const handleBulkRegister = () => {
    if (!bulkText.trim()) return;
    const regex = /(\d+)\s*(?:번|:|-|=|문제)?\s*(\D*)(\d+)/g;
    const newQuestions = [];
    let match;
    while ((match = regex.exec(bulkText)) !== null) {
      const qNum = match[1];
      const answer = match[3];
      newQuestions.push({
        id: `q${Date.now()}-${qNum}`,
        text: `${qNum}번 문제`,
        type: 'choice',
        options: ['1', '2', '3', '4', '5'],
        correctAnswer: answer,
        score: 10
      });
    }
    if (newQuestions.length > 0) {
      setQuestions([...questions, ...newQuestions]);
      setBulkText('');
      setShowBulkInput(false);
      alert(`${newQuestions.length}개의 문제가 등록되었습니다.`);
    } else {
      alert('형식에 맞는 내용을 찾을 수 없습니다.');
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) return alert('과제 제목을 입력해주세요.');
    if (!dueDate) return alert('마감일을 설정해주세요.');
    if (questions.length === 0) return alert('최소 한 개 이상의 문제를 추가해주세요.');
    for (let q of questions) {
      if (!q.correctAnswer) return alert('모든 문제에 정답을 설정해주세요.');
    }

    const finalExcellentScore = excellentScore > 0 ? excellentScore : 100;
    onSave({ title, targetClass, dueDate, excellentScore: finalExcellentScore, questions });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">과제 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="예: 1단원 형성평가"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">대상 학급(반)</label>
          <select
            value={targetClass}
            onChange={(e) => setTargetClass(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">마감 일시</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-yellow-800 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> 우수 학생 기준 점수 (상점 +1)
            </label>
            <span className="text-xs text-yellow-600 bg-white px-2 py-1 rounded border border-yellow-200">
              총점: 100점 만점 기준
            </span>
          </div>
          <input
            type="number"
            value={excellentScore}
            onChange={(e) => setExcellentScore(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
            placeholder={`기준 점수 입력 (미입력 시 100점)`}
          />
          <p className="text-xs text-yellow-600 mt-1">* 이 점수 이상을 받은 학생에게는 상점 1점이 추가로 지급됩니다.</p>
        </div>
      </div>

      {/* 빠른 문항 등록 섹션 */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <button
          onClick={() => setShowBulkInput(!showBulkInput)}
          className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-2 hover:text-indigo-900 transition-colors"
        >
          <Wand2 className="w-4 h-4" /> 빠른 문항 등록 (정답 자동 입력)
        </button>

        {showBulkInput && (
          <div className="animate-fade-in-down space-y-2">
            <p className="text-xs text-indigo-600 mb-2">
              예시: "1번 5, 2번 3, 3번 1" 또는 "1-5 2-3 3-1" 형식
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full px-3 py-2 border border-indigo-200 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="여기에 텍스트를 붙여넣으세요"
              rows={3}
            />
            <button
              onClick={handleBulkRegister}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
            >
              적용하기
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <button
              onClick={() => removeQuestion(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div className="flex gap-4 mb-3">
              <span className="font-bold text-gray-500 py-2">Q{index + 1}.</span>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="문제 내용을 입력하세요"
                />
                <div className="flex gap-4 items-center">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="short">주관식 (단답형)</option>
                    <option value="choice">객관식 (5지선다)</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider">채점 기준 설정</h4>
                  {q.type === 'short' ? (
                    <div>
                      <label className="block text-xs text-blue-600 mb-1">정답 (텍스트):</label>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="정확한 정답"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs text-blue-600 mb-1">보기 입력 및 정답 선택:</label>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt && opt !== ''}
                            onChange={() => updateQuestion(index, 'correctAnswer', opt)}
                            className="text-blue-600 focus:ring-blue-500"
                            disabled={!opt}
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(index, oIndex, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                            placeholder={`보기 ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={addQuestion} className="flex-1 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-400 transition-colors font-medium flex justify-center items-center gap-2">
          <Plus className="w-4 h-4" /> 문제 추가
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <button onClick={onCancel} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">취소</button>
        <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> 과제 저장
        </button>
      </div>
    </div>
  );
};

const AuthScreen = ({ view, onChangeView, onLogin, onRegister, availableClasses }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [className, setClassName] = useState(availableClasses?.[0] || '');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'login') {
      onLogin(username, password);
    } else {
      if (!name || !school || !grade || !className || !phone) return alert('모든 정보를 입력해주세요.');
      onRegister(username, password, name, school, grade, className, phone);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden my-8">
        <div className="bg-blue-600 p-8 text-center text-white">
          <img
            src="유진T 로고 용량 다운.jpg"
            alt="유진T 로고"
            className="h-20 w-auto mx-auto mb-4 object-contain bg-white rounded-lg p-2 shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-90 hidden" />
          <h1 className="text-2xl font-bold">유진T의 스마트 클래스</h1>
          <p className="text-blue-100 mt-2">
            {view === 'login' ? '로그인하여 학습을 시작하세요' : '학생 회원가입 신청'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 (실명)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="예: 홍길동"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">학교명</label>
                    <input
                      type="text"
                      required
                      className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                      placeholder="한국중"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
                    <input
                      type="number"
                      required
                      className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">반 (Class)</label>
                    <select
                      required
                      className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                    >
                      <option value="" disabled>선택</option>
                      {availableClasses?.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="예: 010-1234-5678"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="아이디 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md transition-colors mt-4"
            >
              {view === 'login' ? '로그인' : '가입 신청하기'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {view === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <button onClick={() => onChangeView('register')} className="text-blue-600 font-bold hover:underline">
                  학생 회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button onClick={() => onChangeView('login')} className="text-blue-600 font-bold hover:underline">
                  로그인
                </button>
              </>
            )}
          </div>

          {view === 'login' && (
            <div className="mt-8 pt-6 border-t text-xs text-gray-400 text-center">
              <p>인스타그램 @woollim_t</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 2. Composite Components (Depend on Helpers) ---

const StudentDetailView = ({ student, assignments, submissions, onBack, onUpdatePoints, classes, onUpdateStudentClass }) => {
  const [viewMode, setViewMode] = useState('monthly');
  const [isEditingClass, setIsEditingClass] = useState(false);

  const mySubs = submissions.filter(s => s.studentId === student.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalSubmissions = mySubs.length;
  const lateCount = mySubs.filter(s => s.isLate).length;
  const avgScore = totalSubmissions > 0
    ? Math.round(mySubs.reduce((acc, cur) => acc + (cur.score / cur.maxScore) * 100, 0) / totalSubmissions)
    : 0;

  const groupedData = useMemo(() => {
    const groups = {};
    mySubs.forEach(sub => {
      const date = new Date(sub.timestamp);
      let key;
      if (viewMode === 'monthly') {
        key = `${date.getFullYear()}.${date.getMonth() + 1}`;
      } else {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        key = `${monday.getMonth() + 1}월 ${Math.ceil(monday.getDate() / 7)}주차`;
      }

      if (!groups[key]) {
        groups[key] = { count: 0, totalScore: 0, late: 0, items: [] };
      }
      groups[key].count += 1;
      groups[key].totalScore += (sub.score / sub.maxScore) * 100;
      if (sub.isLate) groups[key].late += 1;
      groups[key].items.push(sub);
    });
    return groups;
  }, [mySubs, viewMode]);

  const groupKeys = Object.keys(groupedData).sort().reverse();
  const getAssignmentTitle = (id) => assignments.find(a => a.id === id)?.title || `과제 #${id}`;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> 학생 목록으로 돌아가기
      </button>

      {/* 프로필 및 점수 관리 카드 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl mr-2">{student.character || '🥚'}</span>
            {student.name} <span className="text-sm font-normal text-gray-500">({student.username})</span>
          </h2>
          <div className="flex gap-4 mt-2 text-sm text-gray-600 pl-12 items-center">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              {student.school} {student.grade}학년
              {isEditingClass ? (
                <select
                  className="ml-1 text-xs border rounded p-0.5 bg-white"
                  value={student.className}
                  onChange={(e) => {
                    onUpdateStudentClass(student.id, e.target.value);
                    setIsEditingClass(false);
                  }}
                  onBlur={() => setIsEditingClass(false)}
                >
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <>
                  {student.className}
                  <button onClick={() => setIsEditingClass(true)} className="ml-1 text-gray-400 hover:text-blue-500">
                    <Edit3 className="w-3 h-3" />
                  </button>
                </>
              )}
            </span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {student.phone}</span>
          </div>

          {/* 통계 요약 */}
          <div className="flex gap-4 mt-6 pl-12">
            <div className="text-center px-4 border-r">
              <div className="text-xl font-bold text-blue-600">{totalSubmissions}</div>
              <div className="text-xs text-gray-500">총 제출</div>
            </div>
            <div className="text-center px-4 border-r">
              <div className="text-xl font-bold text-green-600">{avgScore}점</div>
              <div className="text-xs text-gray-500">평균 점수</div>
            </div>
            <div className="text-center px-4">
              <div className={`text-xl font-bold ${lateCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>{lateCount}</div>
              <div className="text-xs text-gray-500">지각 횟수</div>
            </div>
          </div>
        </div>

        {/* 점수 수동 관리 패널 */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full md:w-auto min-w-[250px]">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" /> 점수 수동 관리
          </h4>

          <div className="space-y-4">
            {/* 상점 관리 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-yellow-700">현재 상점 (누적)</span>
                <span className="text-sm font-bold text-yellow-600">{student.rewardPoints}점</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdatePoints(student.id, 'reward', 1)}
                  className="flex-1 bg-white border border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 text-gray-700 py-1 rounded text-xs flex justify-center items-center gap-1 transition-colors"
                >
                  <PlusCircle className="w-3 h-3" /> 부여
                </button>
                <button
                  onClick={() => onUpdatePoints(student.id, 'reward', -1)}
                  className="flex-1 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-700 py-1 rounded text-xs flex justify-center items-center gap-1 transition-colors"
                >
                  <MinusCircle className="w-3 h-3" /> 차감
                </button>
              </div>
            </div>

            {/* 벌점 관리 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-red-700">현재 벌점 (월간)</span>
                <span className="text-sm font-bold text-red-600">{student.penaltyPoints}점</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdatePoints(student.id, 'penalty', 1)}
                  className="flex-1 bg-white border border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 py-1 rounded text-xs flex justify-center items-center gap-1 transition-colors"
                >
                  <PlusCircle className="w-3 h-3" /> 부여
                </button>
                <button
                  onClick={() => onUpdatePoints(student.id, 'penalty', -1)}
                  className="flex-1 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-100 text-gray-700 py-1 rounded text-xs flex justify-center items-center gap-1 transition-colors"
                >
                  <MinusCircle className="w-3 h-3" /> 차감
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 누적 데이터 뷰 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" /> 누적 과제 리포트
          </h3>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              월별 보기
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              주간 보기
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {groupKeys.length === 0 ? (
            <div className="text-center py-10 text-gray-400">제출된 과제 데이터가 없습니다.</div>
          ) : (
            groupKeys.map(key => {
              const group = groupedData[key];
              const groupAvg = Math.round(group.totalScore / group.count);

              return (
                <div key={key} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                    <span className="font-bold text-gray-700">{key} 리포트</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">제출: <b>{group.count}</b>건</span>
                      <span className="text-gray-600">평균: <b className="text-blue-600">{groupAvg}점</b></span>
                      <span className="text-gray-600">지각: <b className={group.late > 0 ? 'text-red-500' : 'text-gray-400'}>{group.late}</b>건</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {group.items.map(sub => (
                      <div key={sub.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50/50">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{getAssignmentTitle(sub.assignmentId)}</span>
                          <span className="text-xs text-gray-400">{sub.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.isLate && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">지각</span>
                              {sub.penaltyApplied > 0 && <span className="text-[10px] text-red-500">벌점 +{sub.penaltyApplied}</span>}
                            </div>
                          )}
                          {sub.rewardEarned > 0 && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500" /> +{sub.rewardEarned}
                              </span>
                            </div>
                          )}
                          <span className={`text-sm font-bold ${sub.score === sub.maxScore ? 'text-green-600' : 'text-gray-700'}`}>
                            {sub.score} / {sub.maxScore}점
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const StudentManagement = ({ users, assignments, submissions, onApprove, onDelete, onUpdatePoints, classes, onUpdateStudentClass, onResetAllPenalties }) => {
  const [filterClass, setFilterClass] = useState('전체');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const students = users.filter(u => u.role === 'student');
  const pendingStudents = students.filter(u => u.status === 'pending');

  const activeStudents = students.filter(u => {
    const isApproved = u.status === 'active';
    const isClassMatch = filterClass === '전체' || u.className === filterClass;
    return isApproved && isClassMatch;
  });

  const classList = ['전체', ...Array.from(new Set(students.filter(u => u.className).map(u => u.className))).sort()];

  const selectedStudent = selectedStudentId ? users.find(u => u.id === selectedStudentId) : null;

  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        assignments={assignments}
        submissions={submissions}
        onBack={() => setSelectedStudentId(null)}
        onUpdatePoints={onUpdatePoints}
        classes={classes}
        onUpdateStudentClass={onUpdateStudentClass}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Approvals */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> 가입 승인 대기 ({pendingStudents.length})
        </h3>
        {pendingStudents.length === 0 ? (
          <p className="text-orange-600/70 text-sm">현재 대기 중인 가입 신청이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {pendingStudents.map(student => (
              <div key={student.id} className="bg-white p-4 rounded-lg border border-orange-100 flex justify-between items-center shadow-sm">
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {student.name}
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {student.school} {student.grade}학년 {student.className}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">ID: {student.username} | ☎ {student.phone}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(student.id)}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    거절
                  </button>
                  <button
                    onClick={() => onApprove(student.id)}
                    className="px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors font-medium"
                  >
                    승인하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Students */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5" /> 등록된 학생 목록 ({activeStudents.length})
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-sm flex-1 md:flex-none">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border-none focus:ring-0 text-gray-600 bg-transparent font-medium cursor-pointer w-full"
              >
                {classList.map(c => <option key={c} value={c}>{c === '전체' ? '전체 학급' : c}</option>)}
              </select>
            </div>
            {/* 월초 초기화 버튼 */}
            <button
              onClick={onResetAllPenalties}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm border border-red-200 transition-colors"
              title="이번 달 벌점을 모두 0으로 초기화합니다 (월초 시뮬레이션)"
            >
              <RotateCcw className="w-4 h-4" /> 전체 벌점 초기화
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold">이름</th>
                <th className="px-6 py-3 font-semibold">학교/학년/반</th>
                <th className="px-6 py-3 font-semibold text-center">캐릭터</th>
                <th className="px-6 py-3 font-semibold text-center">누적 상점</th>
                <th className="px-6 py-3 font-semibold text-center">벌점 (월간)</th>
                <th className="px-6 py-3 font-semibold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedStudentId(student.id)}>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {student.school ? `${student.school} ${student.grade}학년 ${student.className}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-2xl">{student.character || '🥚'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                      <Star className="w-3 h-3 fill-yellow-500 mr-1" />
                      {student.rewardPoints}점
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${student.penaltyPoints >= 5 ? 'bg-red-100 text-red-600 animate-pulse' :
                      student.penaltyPoints > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {student.penaltyPoints}점
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedStudentId(student.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded"
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => onDelete(student.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="학생 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {activeStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    등록된 학생이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ currentUser, assignments, onSubmit, submissions, onChangeCharacter }) => {
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('전체');

  if (currentUser.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-orange-200">
        <ShieldAlert className="w-16 h-16 text-orange-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">승인 대기 중</h2>
        <p className="text-gray-600 text-center max-w-md">
          회원가입 신청이 접수되었습니다.<br />
          선생님의 승인 후 과제를 수행할 수 있습니다.
        </p>
      </div>
    );
  }

  const myAssignments = assignments.filter(a => {
    const classMatch = a.targetClass === '전체' || a.targetClass === currentUser.className;
    const date = new Date(a.dueDate);
    const monthMatch = selectedMonth === '전체' || (date.getMonth() + 1).toString() === selectedMonth;
    return classMatch && monthMatch;
  });

  const activeAssignment = assignments.find(a => a.id === activeAssignmentId);
  const isSubmitted = (assignmentId) => submissions.some(s => s.assignmentId === assignmentId && s.studentId === currentUser.id);

  const studentMonthList = ['전체', ...Array.from(new Set(assignments.filter(a => a.targetClass === currentUser.className).map(a => (new Date(a.dueDate).getMonth() + 1).toString()))).sort((a, b) => a - b)];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">{currentUser.character}</span>
            {currentUser.name}의 성장 기록
          </h3>
          <p className="text-indigo-100 text-sm mt-1">다음 캐릭터 잠금 해제까지 열심히 달려보세요!</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold flex items-center justify-end gap-1">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            {currentUser.rewardPoints}
          </div>
          <button
            onClick={onChangeCharacter}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full mt-2 transition-colors"
          >
            캐릭터 변경하기 &gt;
          </button>
        </div>
      </div>

      {!activeAssignmentId && !currentResult ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">나의 강의실 ({currentUser.className})</h2>
              <p className="text-gray-500 mt-1">할당된 과제를 확인하고 문제를 풀어보세요.</p>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent font-medium cursor-pointer"
              >
                {studentMonthList.map(m => <option key={m} value={m}>{m === '전체' ? '전체 월' : `${m}월`}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myAssignments.map(assignment => {
              const submitted = isSubmitted(assignment.id);
              const mySubmission = submissions.find(s => s.assignmentId === assignment.id && s.studentId === currentUser.id);
              const isOverDue = new Date() > new Date(assignment.dueDate);

              return (
                <div key={assignment.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-blue-500"></div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                    <div className="space-y-1 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        마감: {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p>문항 수: {assignment.questions.length}개</p>
                    </div>
                  </div>

                  {submitted ? (
                    <div className="mt-4">
                      <div className={`px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center mb-2 ${mySubmission.isLate ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                        }`}>
                        <span>{mySubmission.isLate ? '지각 제출됨' : '제출 완료'}</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">점수: <span className="font-bold">{mySubmission.score}</span> / {mySubmission.maxScore}</span>
                        {mySubmission.rewardEarned > 0 && (
                          <span className="text-yellow-600 font-bold flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-yellow-500" /> +{mySubmission.rewardEarned}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {isOverDue && (
                        <div className="flex items-center gap-1 text-xs text-red-500 font-bold mb-2">
                          <AlertTriangle className="w-3 h-3" /> 마감 기한이 지났습니다 (지각 제출 가능)
                        </div>
                      )}
                      <button
                        onClick={() => setActiveAssignmentId(assignment.id)}
                        className={`w-full py-2 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 ${isOverDue
                          ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                      >
                        {isOverDue ? '지각 제출하기' : '문제 풀기'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {myAssignments.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed text-gray-400">
                <p className="text-lg mb-1">등록된 과제가 없습니다.</p>
                <p className="text-sm">선생님이 과제를 올리면 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </>
      ) : currentResult ? (
        <ResultView
          result={currentResult}
          onClose={() => {
            setCurrentResult(null);
            setActiveAssignmentId(null);
          }}
        />
      ) : (
        <AssignmentPlayer
          assignment={activeAssignment}
          onBack={() => setActiveAssignmentId(null)}
          onComplete={(answers) => {
            const result = onSubmit(activeAssignment.id, answers);
            setCurrentResult(result);
            setActiveAssignmentId(null);
          }}
        />
      )}
    </div>
  );
};

const TeacherDashboard = ({ assignments, onAdd, onDelete, submissions, users, onApproveStudent, onDeleteUser, onUpdatePoints, classes, onAddClass, onRemoveClass, onUpdateStudentClass, onResetAllPenalties }) => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedClass, setSelectedClass] = useState('전체');
  const [selectedMonth, setSelectedMonth] = useState('전체');
  const [newClassName, setNewClassName] = useState('');

  const pendingCount = users.filter(u => u.role === 'student' && u.status === 'pending').length;

  const filteredAssignments = assignments.filter(a => {
    const classMatch = selectedClass === '전체' || a.targetClass === selectedClass;
    const date = new Date(a.dueDate);
    const monthMatch = selectedMonth === '전체' || (date.getMonth() + 1).toString() === selectedMonth;
    return classMatch && monthMatch;
  });

  const monthList = ['전체', ...Array.from(new Set(assignments.map(a => (new Date(a.dueDate).getMonth() + 1).toString()))).sort((a, b) => a - b)];

  const handleAddClass = () => {
    if (newClassName.trim()) {
      onAddClass(newClassName.trim());
      setNewClassName('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <BookOpen className="w-4 h-4" /> 과제 관리
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors relative ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <Users className="w-4 h-4" /> 학생 관리
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('classManagement')}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'classManagement' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <Settings className="w-4 h-4" /> 클래스 관리
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">과제 관리</h2>
              <p className="text-gray-500 mt-1">새로운 과제를 만들고 우수 학생 기준을 설정하세요.</p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent font-medium cursor-pointer"
                >
                  <option value="전체">전체 학급</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-sm border-none focus:ring-0 text-gray-600 bg-transparent font-medium cursor-pointer"
                >
                  {monthList.map(m => <option key={m} value={m}>{m === '전체' ? '전체 월' : `${m}월`}</option>)}
                </select>
              </div>

              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" /> 새 과제 만들기
              </button>
            </div>
          </div>

          {isCreating && (
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg animate-fade-in-down">
              <CreateAssignmentForm
                classes={classes}
                onSave={(data) => {
                  onAdd(data);
                  setIsCreating(false);
                }}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map(assignment => (
              <div key={assignment.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                    {assignment.targetClass}
                  </div>
                  <button
                    onClick={() => onDelete(assignment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    마감: {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 까지
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                    <Trophy className="w-3 h-3" />
                    우수 기준: {assignment.excellentScore}점 이상
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex justify-between">
                  <span>문항 수: {assignment.questions.length}개</span>
                  <span className="text-gray-400 text-xs">ID: {assignment.id}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">과제별 제출 현황</h3>
            {filteredAssignments.map(assignment => {
              // 해당 과제의 대상 학생 필터링
              const targetStudents = users.filter(u =>
                u.role === 'student' &&
                u.status === 'active' &&
                (assignment.targetClass === '전체' || u.className === assignment.targetClass) &&
                (selectedClass === '전체' || u.className === selectedClass)
              ).sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));

              if (targetStudents.length === 0) return null;

              return (
                <div key={assignment.id} className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      {assignment.title}
                      <span className="text-xs font-normal text-gray-500 bg-white border px-2 py-0.5 rounded">
                        {assignment.targetClass}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      마감: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-2 font-medium">클래스</th>
                        <th className="px-6 py-2 font-medium">이름</th>
                        <th className="px-6 py-2 font-medium">제출 상태</th>
                        <th className="px-6 py-2 font-medium">점수</th>
                        <th className="px-6 py-2 font-medium">제출 시간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {targetStudents.map(student => {
                        const submission = submissions.find(s => s.assignmentId === assignment.id && s.studentId === student.id);
                        const isSubmitted = !!submission;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-600">{student.className}</td>
                            <td className="px-6 py-3 font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-3">
                              {isSubmitted ? (
                                submission.isLate ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    지각 제출
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    제출 완료
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                                  미제출
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3">
                              {isSubmitted ? (
                                <span className={`font-bold ${submission.score === submission.maxScore ? 'text-green-600' : 'text-gray-700'}`}>
                                  {submission.score} / {submission.maxScore}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-gray-500">
                              {isSubmitted ? submission.timestamp : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
            {filteredAssignments.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                표시할 과제가 없습니다.
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'classManagement' ? (
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">새로운 클래스 추가</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="예: 3반, 심화반 등"
              />
              <button
                onClick={handleAddClass}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> 추가
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">현재 개설된 클래스 목록</h3>
            {classes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">개설된 클래스가 없습니다.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {classes.map(cls => (
                  <li key={cls} className="py-3 flex justify-between items-center group">
                    <span className="font-medium text-gray-700">{cls}</span>
                    <button
                      onClick={() => onRemoveClass(cls)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <StudentManagement
          users={users}
          assignments={assignments}
          submissions={submissions}
          onApprove={onApproveStudent}
          onDelete={onDeleteUser}
          onUpdatePoints={onUpdatePoints}
          classes={classes}
          onUpdateStudentClass={onUpdateStudentClass}
          onResetAllPenalties={onResetAllPenalties}
        />
      )}
    </div>
  );
};

// --- App Component (Root) ---

const App = () => {
  // --- 1. State: DB에서 가져올 데이터들을 담을 빈 그릇들 ---
  const [classes, setClasses] = useState([]); // DB에서 가져올 예정
  const [users, setUsers] = useState([]);     // 선생님일 때 학생 목록
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  // --- 2. 초기화: 앱 실행 시 클래스 목록 가져오기 & 로그인 상태 체크 ---
  useEffect(() => {
    fetchClasses();       // 클래스 목록 가져오기
    checkUserSession();   // 로그인 유지 확인
  }, []);

  // 클래스 목록 가져오기 (회원가입 폼에 보여주기 위해)
  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('name');
    if (data) setClasses(data.map(c => c.name));
  };

  // 로그인 성공 시 추가 데이터를 불러오도록 수정
  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // DB 컬럼명(snake_case)을 앱 변수명(camelCase)으로 매핑하여 저장
        const mappedProfile = {
          ...profile,
          className: profile.class_name,
          penaltyPoints: profile.penalty_points,
          rewardPoints: profile.reward_points
        };
        setCurrentUser(mappedProfile);

        // 공통 데이터 로드
        fetchAssignments();
        fetchSubmissions();

        if (mappedProfile.role === 'teacher') {
          fetchStudents();
        }
      }
    }
  };

  // 과제 목록 불러오기
  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // DB의 snake_case를 React의 camelCase로 변환
      const mapped = data.map(a => ({
        ...a,
        targetClass: a.target_class,
        dueDate: a.due_date,
        excellentScore: a.excellent_score
      }));
      setAssignments(mapped);
    }
  };

  // 제출 내역 불러오기
  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (data) {
      const mapped = data.map(s => ({
        ...s,
        assignmentId: s.assignment_id,
        studentId: s.student_id,
        maxScore: s.max_score,
        isLate: s.is_late,
        penaltyApplied: s.penalty_applied,
        rewardEarned: s.reward_earned
      }));
      setSubmissions(mapped);
    }
  };

  // --- 3. 회원가입 (Auth + DB) ---
  const registerUser = async (username, password, name, school, grade, className, phone) => {
    // 1. Supabase Auth에 이메일/비번으로 가입 (아이디를 이메일 형식으로 변환해서 사용)
    const email = `${username}@school.com`; // 아이디를 가짜 이메일로 만듦

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert('가입 실패: ' + error.message);
      return false;
    }

    if (data.user) {
      // 2. 가입 성공 시, 나머지 정보를 'profiles' 테이블에 저장
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id, // Auth의 ID와 똑같이 맞춤 (중요!)
          username,
          name,
          school,
          grade,
          class_name: className, // DB 컬럼명: class_name
          phone,
          role: 'student',
          status: 'pending', // 승인 대기 상태
          penalty_points: 0,
          reward_points: 0,
          character: '🥚'
        }
      ]);

      if (profileError) {
        alert('프로필 저장 실패: ' + profileError.message);
      } else {
        alert('가입 신청이 완료되었습니다. 선생님의 승인을 기다려주세요.');
        setAuthView('login');
      }
    }
  };

  // --- 4. 로그인 (Auth + DB) ---
  const login = async (username, password) => {
    // 1. Supabase Auth에 로그인 요청
    const email = `${username}@school.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert('로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
      return;
    }

    // 2. 로그인 성공 시, 내 정보를 profiles 테이블에서 가져옴
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        alert('회원 정보를 불러올 수 없습니다.');
        return;
      }

      // 선생님이면 학생 목록도 미리 가져오기
      if (profile.role === 'teacher') {
        fetchStudents();
      }

      setCurrentUser(profile);
    }
  };

  // 학생 목록 불러오기 (수정됨)
  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student');
    if (data) {
      const mapped = data.map(s => ({
        ...s,
        className: s.class_name,
        penaltyPoints: s.penalty_points,
        rewardPoints: s.reward_points
      }));
      setUsers(mapped);
    }
  };

  // --- 5. 로그아웃 ---
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUsers([]); // 데이터 비우기
  };

  // --- 6. 기타 기능들 (아직 DB 연결 안 함, 일단 유지) ---

  // (임시) 학생 승인 기능 - DB 연동 필요
  const approveStudent = async (userId) => {
    // DB 업데이트
    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
    if (!error) {
      // 로컬 상태 업데이트 (화면 갱신용)
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    }
  };

  // (임시) 사용자 삭제
  const deleteUser = async (userId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      // DB 삭제
      await supabase.from('profiles').delete().eq('id', userId);
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  // 1. 과제 추가
  const addAssignment = async (newA) => {
    const { data, error } = await supabase.from('assignments').insert([{
      title: newA.title,
      target_class: newA.targetClass,
      due_date: newA.dueDate,
      excellent_score: newA.excellentScore,
      questions: newA.questions
    }]).select();

    if (error) {
      alert('과제 등록 실패: ' + error.message);
    } else if (data) {
      // 로컬 상태 업데이트 (화면 즉시 반영)
      const created = data[0];
      setAssignments([{
        ...created,
        targetClass: created.target_class,
        dueDate: created.due_date,
        excellentScore: created.excellent_score
      }, ...assignments]);
      alert('과제가 등록되었습니다.');
    }
  };

  // 2. 과제 삭제
  const deleteAssignment = async (id) => {
    if (!window.confirm('정말 이 과제를 삭제하시겠습니까? 제출된 내역도 모두 삭제됩니다.')) return;

    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (!error) {
      setAssignments(assignments.filter(a => a.id !== id));
      // 제출 내역도 로컬에서 제거
      setSubmissions(submissions.filter(s => s.assignmentId !== id));
    } else {
      alert('삭제 실패');
    }
  };

  // 3. 과제 제출 및 채점 로직 (핵심)
  const submitAssignment = (assignmentId, answers) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    // 채점 로직 (기존 로직 활용)
    let score = 0;
    const maxScore = assignment.questions.reduce((acc, q) => acc + q.score, 0);
    const results = assignment.questions.map(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) score += q.score;
      return {
        qId: q.id,
        studentAnswer: answers[q.id],
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    // 지각 및 보상 계산
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;
    const penaltyApplied = isLate ? 0 : 0; // 지각 벌점 정책이 있다면 수정 (예: isLate ? 5 : 0)
    const rewardEarned = (!isLate && score >= assignment.excellentScore) ? 1 : 0;

    // DB에 제출 내역 저장
    const saveSubmission = async () => {
      const { data, error } = await supabase.from('submissions').insert([{
        assignment_id: assignmentId,
        student_id: currentUser.id,
        answers: answers,
        score: score,
        max_score: maxScore,
        is_late: isLate,
        penalty_applied: penaltyApplied,
        reward_earned: rewardEarned
      }]).select();

      if (!error && data) {
        const newSub = data[0];
        // 로컬 submissions 상태 업데이트
        setSubmissions([{
          ...newSub,
          assignmentId: newSub.assignment_id,
          studentId: newSub.student_id,
          maxScore: newSub.max_score,
          isLate: newSub.is_late,
          penaltyApplied: newSub.penalty_applied,
          rewardEarned: newSub.reward_earned
        }, ...submissions]);

        // 상점/벌점 업데이트가 있다면 프로필에도 반영
        if (rewardEarned > 0 || penaltyApplied > 0) {
          await handleManualPointUpdate(currentUser.id, 'reward', rewardEarned);
          if (penaltyApplied > 0) await handleManualPointUpdate(currentUser.id, 'penalty', penaltyApplied);
        }
      }
    };

    saveSubmission();

    return { score, maxScore, isLate, penaltyApplied, rewardEarned, results };
  };

  // 4. 점수 수동 관리 (상점/벌점)
  const handleManualPointUpdate = async (id, type, delta) => {
    // DB 업데이트
    const column = type === 'reward' ? 'reward_points' : 'penalty_points';

    // 현재 유저 찾기 (로컬 상태에서)
    const targetUser = users.find(u => u.id === id) || (currentUser.id === id ? currentUser : null);
    if (!targetUser) return;

    const currentVal = type === 'reward' ? targetUser.rewardPoints : targetUser.penaltyPoints;
    const newVal = Math.max(0, currentVal + delta); // 0보다 작아지지 않게

    const { error } = await supabase
      .from('profiles')
      .update({ [column]: newVal })
      .eq('id', id);

    if (!error) {
      // 로컬 상태 업데이트
      const updater = (u) => {
        if (u.id !== id) return u;
        return type === 'reward'
          ? { ...u, rewardPoints: newVal, reward_points: newVal }
          : { ...u, penaltyPoints: newVal, penalty_points: newVal };
      };

      setUsers(users.map(updater));
      if (currentUser.id === id) {
        setCurrentUser(updater(currentUser));
      }
    }
  };

  // 5. 클래스 추가
  const addClass = async (newClass) => {
    const { data, error } = await supabase.from('classes').insert([{ name: newClass }]).select();
    if (!error && data) {
      setClasses([...classes, data[0].name]);
    } else {
      alert('클래스 추가 실패 (중복된 이름일 수 있습니다)');
    }
  };

  // 6. 클래스 삭제
  const removeClass = async (targetClass) => {
    if (!window.confirm(`${targetClass}을(를) 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('classes').delete().eq('name', targetClass);
    if (!error) {
      setClasses(classes.filter(c => c !== targetClass));
    }
  };

  // 7. 학생 반 이동
  const updateStudentClass = async (id, cls) => {
    const { error } = await supabase.from('profiles').update({ class_name: cls }).eq('id', id);
    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, className: cls, class_name: cls } : u));
    }
  };

  // 8. 캐릭터 변경
  const changeCharacter = async (icon) => {
    const { error } = await supabase.from('profiles').update({ character: icon }).eq('id', currentUser.id);
    if (!error) {
      setCurrentUser({ ...currentUser, character: icon });
      setShowCharacterModal(false);
    }
  };

  // 9. 월초 벌점 초기화
  const resetAllPenalties = async () => {
    if (!window.confirm('모든 학생의 벌점을 0으로 초기화하시겠습니까?')) return;

    const { error } = await supabase.from('profiles').update({ penalty_points: 0 }).eq('role', 'student');

    if (!error) {
      setUsers(users.map(u => ({ ...u, penaltyPoints: 0, penalty_points: 0 })));
      alert('초기화되었습니다.');
    }
  };


  // --- 렌더링 (화면 보여주기) ---
  if (!currentUser) {
    return (
      <AuthScreen
        view={authView}
        onChangeView={setAuthView}
        onLogin={login}
        onRegister={registerUser}
        availableClasses={classes}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* --- 수정된 헤더 시작 (모바일 최적화 적용) --- */}
      <header className="bg-white border-b px-4 py-3 md:px-6 md:py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        {/* 왼쪽: 로고 및 제목 */}
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src="유진T 로고 용량 다운.jpg"
            alt="유진T 로고"
            className="h-8 w-auto md:h-10 object-contain bg-white rounded-md"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <BookOpen className="text-blue-600 w-6 h-6 hidden" />
          {/* 모바일: 글씨 작게 & 두 줄 / PC: 크게 & 한 줄 */}
          <h1 className="text-sm md:text-xl font-bold text-gray-900 leading-tight">
            유진T의<br className="md:hidden" /> 스마트 클래스
          </h1>
        </div>

        {/* 오른쪽: 사용자 정보 & 로그아웃 */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-2 py-1 md:px-4 md:py-1.5 rounded-full">
            {currentUser.role === 'student' ? (
              <button
                onClick={() => setShowCharacterModal(true)}
                className="text-xl md:text-2xl hover:scale-110 transition-transform cursor-pointer"
              >
                {currentUser.character}
              </button>
            ) : <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />}

            <div className="flex flex-col md:flex-row md:items-center md:gap-2 leading-tight">
              {/* 이름은 항상 표시하되 모바일은 작게 */}
              <span><span className="font-bold text-gray-900 text-sm md:text-base">{currentUser.name}</span></span>

              {/* 모바일에서는 공간 확보를 위해 '구분선'과 '반 정보' 숨김 */}
              <span className="text-xs text-gray-400 hidden md:inline">|</span>
              <span className="text-xs text-gray-500 hidden md:inline">
                {currentUser.role === 'teacher' ? '선생님' : `${currentUser.class_name || '학생'}`}
              </span>
            </div>

            {currentUser.role === 'student' && (
              <div className="flex gap-1 ml-1">
                {/* 상점 뱃지도 모바일에서는 조금 작게 */}
                <div className="px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold flex items-center gap-0.5 bg-yellow-100 text-yellow-700">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {currentUser.reward_points}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            {/* 모바일에서는 '로그아웃' 글자 숨기고 아이콘만 표시 */}
            <span className="hidden md:inline">로그아웃</span>
          </button>
        </div>
      </header>
      {/* --- 수정된 헤더 끝 --- */}

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        {currentUser.role === 'teacher' ? (
          <TeacherDashboard
            assignments={assignments}
            onAdd={addAssignment}
            onDelete={deleteAssignment}
            submissions={submissions}
            users={users} // DB에서 가져온 users
            onApproveStudent={approveStudent}
            onDeleteUser={deleteUser}
            onUpdatePoints={handleManualPointUpdate}
            classes={classes}
            onAddClass={addClass}
            onRemoveClass={removeClass}
            onUpdateStudentClass={updateStudentClass}
            onResetAllPenalties={resetAllPenalties}
          />
        ) : (
          <StudentDashboard
            currentUser={currentUser}
            assignments={assignments}
            onSubmit={submitAssignment}
            submissions={submissions}
            onChangeCharacter={() => setShowCharacterModal(true)}
            CHARACTERS={CHARACTERS}
          />
        )}
      </main>

      {/* 캐릭터 모달 (기존 코드 유지, 변수명만 user.reward_points로 수정 필요) */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in overflow-y-auto py-10">
          {/* ... 기존 모달 내용 ... (변수명 rewardPoints -> reward_points 로 주의) */}
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setShowCharacterModal(false)} className="absolute top-4 right-4"><XCircle /></button>
            <h3 className="text-xl font-bold mb-4">캐릭터 선택</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {CHARACTERS.map((char, index) => {
                const isUnlocked = (currentUser.reward_points || 0) >= char.minPoints;
                return (
                  <button key={index} disabled={!isUnlocked} onClick={() => changeCharacter(char.icon)}
                    className={`p-3 border rounded-xl flex flex-col items-center ${isUnlocked ? 'hover:bg-purple-50 border-purple-200' : 'opacity-50 bg-gray-100'}`}>
                    <span className="text-3xl">{char.icon}</span>
                    <span className="text-xs font-bold">{char.name}</span>
                    {!isUnlocked && <span className="text-[10px] text-gray-500">{char.minPoints}점 필요</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;