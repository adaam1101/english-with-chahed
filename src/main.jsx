import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import TextType from './TextType';
import { supabase } from './supabase';
import './styles.css';

const Icon = ({ name, size = 18 }) => {
  const paths = { 
    book: '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v16H5.5A2.5 2.5 0 0 0 3 21zM21 5.5A2.5 2.5 0 0 0 18.5 3H13v16h5.5a2.5 2.5 0 0 1 2.5 2z"/>', 
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>', 
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', 
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>', 
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>', 
    check: '<path d="m5 12 4 4L19 6"/>', 
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>', 
    plus: '<path d="M12 5v14M5 12h14"/>' 
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:paths[name]}}/>;
};

const Brand = () => <div className="brand"><span>e</span>nglish <em>with</em> chaheed<span className="dot">.</span></div>;

const checkRateLimit = (actionKey, cooldownSeconds = 10) => {
  const now = Date.now();
  const last = localStorage.getItem(`last_submit_${actionKey}`);
  if (last && now - parseInt(last) < cooldownSeconds * 1000) {
    const waitTime = Math.ceil((cooldownSeconds * 1000 - (now - parseInt(last))) / 1000);
    alert(`Please wait ${waitTime} seconds before submitting again.`);
    return false;
  }
  localStorage.setItem(`last_submit_${actionKey}`, now.toString());
  return true;
};

function LessonModal({ isOpen, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('BAC');
  const [category, setCategory] = useState('VOCABULARY');
  const [duration, setDuration] = useState(15);
  const [fileUrl, setFileUrl] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!checkRateLimit('lesson', 5)) return;
    setBusy(true);
    const { error } = await supabase.from('lessons').insert({
      title,
      level,
      category,
      duration_minutes: parseInt(duration) || 10,
      file_url: fileUrl || null
    });
    setBusy(false);
    if (!error) {
      onSaved();
      onClose();
      setTitle('');
      setFileUrl('');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Create a new <i>lesson</i></h2>
        <p>Fill in the details below to add a new lesson for your students.</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Lesson Title
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Expressing opinions like a native"/>
          </label>
          <label>Student Level
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option value="BAC">BAC (High School)</option>
              <option value="BEM">BEM (Middle School)</option>
            </select>
          </label>
          <label>Lesson Category
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="VOCABULARY">Vocabulary</option>
              <option value="GRAMMAR">Grammar</option>
              <option value="WRITING">Writing</option>
            </select>
          </label>
          <label>Duration (Minutes)
            <input type="number" required value={duration} onChange={e => setDuration(e.target.value)} min="1"/>
          </label>
          <label>Materials Link (PDF, Slides, Drive, Video link)
            <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..."/>
          </label>
          <div className="modal-buttons">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy} className="modal-btn-save">{busy ? 'Saving...' : 'Add Lesson'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SessionModal({ isOpen, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('BAC');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('https://meet.google.com/');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!checkRateLimit('session', 5)) return;
    setBusy(true);
    const { error } = await supabase.from('sessions').insert({
      title,
      level,
      session_date: new Date(date).toISOString(),
      meeting_link: link
    });
    setBusy(false);
    if (!error) {
      onSaved();
      onClose();
      setTitle('');
      setDate('');
      setLink('https://meet.google.com/');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Schedule live <i>session</i></h2>
        <p>Schedule a new live class for your students.</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Session Title
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Essay introductions"/>
          </label>
          <label>Student Level
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option value="BAC">BAC (High School)</option>
              <option value="BEM">BEM (Middle School)</option>
            </select>
          </label>
          <label>Date & Time
            <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)}/>
          </label>
          <label>Meeting Link
            <input required type="url" value={link} onChange={e => setLink(e.target.value)}/>
          </label>
          <div className="modal-buttons">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy} className="modal-btn-save">{busy ? 'Scheduling...' : 'Schedule Class'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssessmentModal({ isOpen, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!checkRateLimit('assessment', 5)) return;
    setBusy(true);
    const { error } = await supabase.from('assessments').insert({
      title,
      description: description || null,
      deadline: new Date(deadline).toISOString(),
      file_url: fileUrl || null
    });
    setBusy(false);
    if (!error) {
      onSaved();
      onClose();
      setTitle('');
      setDescription('');
      setDeadline('');
      setFileUrl('');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Create <i>Assessment</i></h2>
        <p>Create a new assignment with a deadline for your students.</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Assessment Title
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Assessment #4: Vocabulary Review"/>
          </label>
          <label>Instructions/Description
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Write a 150-word essay about opinion expressions"/>
          </label>
          <label>Deadline Date & Time
            <input type="datetime-local" required value={deadline} onChange={e => setDeadline(e.target.value)}/>
          </label>
          <label>Materials Link (PDF, worksheet, etc. - Optional)
            <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..."/>
          </label>
          <div className="modal-buttons">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy} className="modal-btn-save">{busy ? 'Creating...' : 'Create Assessment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmissionModal({ isOpen, onClose, studentId, assessments, onSaved }) {
  const [assessment, setAssessment] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      setAssessment(assessments[0].title);
    }
  }, [assessments]);

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!assessment) {
      alert('No active assessment selected.');
      return;
    }
    if (!checkRateLimit('submission', 10)) return;
    setBusy(true);
    const { error } = await supabase.from('submissions').insert({
      student_id: studentId,
      assessment_name: assessment,
      file_url: link,
      status: 'Pending'
    });
    setBusy(false);
    if (!error) {
      onSaved();
      onClose();
      setLink('');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Submit my <i>work</i></h2>
        <p>Submit your homework link or drive file for evaluation.</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Select Assessment
            <select value={assessment} onChange={e => setAssessment(e.target.value)}>
              {assessments.length === 0 ? (
                <option disabled value="">No assessments available</option>
              ) : (
                assessments.map(ass => (
                  <option key={ass.id} value={ass.title}>{ass.title}</option>
                ))
              )}
            </select>
          </label>
          <label>Link to your work (Google Drive, PDF link, etc.)
            <input required type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://drive.google.com/..."/>
          </label>
          <div className="modal-buttons">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy || assessments.length === 0} className="modal-btn-save">{busy ? 'Submitting...' : 'Submit Work'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeModal({ isOpen, onClose, submission, onSaved }) {
  const [grade, setGrade] = useState('A+');
  const [busy, setBusy] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('submissions').update({
      grade,
      status: 'Graded'
    }).eq('id', submission.id);
    setBusy(false);
    if (!error) {
      onSaved();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Grade <i>submission</i></h2>
        <p>Evaluate work by <b>{submission.profiles?.full_name || 'Student'}</b> for <b>{submission.assessment_name}</b>.</p>
        <div style={{ margin: '15px 0', fontSize: '13px' }}>
          <span>Submitted File: </span>
          <a href={submission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#b64f75', fontWeight: '600' }}>Open link ↗</a>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Select Grade
            <select value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </label>
          <div className="modal-buttons">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy} className="modal-btn-save">{busy ? 'Grading...' : 'Submit Grade'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditStudentModal({ isOpen, onClose, student, onSaved }) {
  const [name, setName] = useState('');
  const [totalDue, setTotalDue] = useState(5000);
  const [amountPaid, setAmountPaid] = useState(0);
  const [status, setStatus] = useState('Unpaid');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.full_name || '');
      setTotalDue(student.total_due ?? 5000);
      setAmountPaid(student.amount_paid ?? 0);
      setStatus(student.payment_status || 'Unpaid');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from('profiles').update({
      full_name: name,
      total_due: parseInt(totalDue) || 0,
      amount_paid: parseInt(amountPaid) || 0,
      payment_status: status
    }).eq('id', student.id);
    setBusy(false);
    if (!error) {
      onSaved();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Edit Student <i>Profile</i></h2>
        <p>Update full name and payment tracking for this student.</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Full Name
            <input required value={name} onChange={e => setName(e.target.value)}/>
          </label>
          <label>Total Tuition Due (DA)
            <input type="number" required value={totalDue} onChange={e => setTotalDue(e.target.value)}/>
          </label>
          <label>Amount Paid (DA)
            <input type="number" required value={amountPaid} onChange={e => setAmountPaid(e.target.value)}/>
          </label>
          <label>Payment Status
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
            </select>
          </label>
          <div className="modal-buttons">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy} className="modal-btn-save">{busy ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeacherDashboard({ onLogout }) {
  const [notice, setNotice] = useState('No announcements published yet.');
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState('');
  const [lessons, setLessons] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [toGradeCount, setToGradeCount] = useState(0);
  
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const pop = m => { setToast(m); setTimeout(() => setToast(''), 2200) };

  const handleNav = (tab, id) => {
    setActiveTab(tab);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDashboardData = async () => {
    const { data: lessonData } = await supabase.from('lessons').select('*').order('created_at', { ascending: false });
    if (lessonData) setLessons(lessonData);

    const { data: annData } = await supabase.from('announcements').select('content').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (annData?.content) setNotice(annData.content);

    const { count: sCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    setStudentCount(sCount || 0);

    const { count: gCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
    setToGradeCount(gCount || 0);

    const { data: sessData } = await supabase.from('sessions').select('*').order('session_date', { ascending: true });
    if (sessData) setSessions(sessData);

    const { data: subData } = await supabase.from('submissions').select('*, profiles(full_name)').order('submitted_at', { ascending: false });
    if (subData) setSubmissions(subData);

    const { data: studentList } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (studentList) setStudents(studentList);

    const { data: assData } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
    if (assData) setAssessments(assData);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const publish = async e => {
    e.preventDefault();
    if (!checkRateLimit('announcement', 10)) return;
    if (draft.trim()) {
      setBusy(true);
      const { error } = await supabase.from('announcements').insert({ content: draft });
      setBusy(false);
      if (!error) {
        setNotice(draft);
        setDraft('');
        pop('Announcement published for all students.');
      } else {
        pop('Error: ' + error.message);
      }
    }
  };

  const handleRemoveStudent = async studentId => {
    if (confirm('Are you sure you want to remove this student? This will delete their profile record.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', studentId);
      if (!error) {
        pop('Student removed.');
        loadDashboardData();
      } else {
        alert(error.message);
      }
    }
  };

  const handleDeleteAssessment = async assessmentId => {
    if (confirm('Are you sure you want to delete this assessment? All associated submissions will also be deleted.')) {
      const { error } = await supabase.from('assessments').delete().eq('id', assessmentId);
      if (!error) {
        pop('Assessment deleted.');
        loadDashboardData();
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <main className="teacher-page">
      <aside className="teacher-sidebar">
        <Brand />
        <div className="teacher-chip">
          <span>CC</span>
          <div>
            <b>Chaheed</b>
            <small>English teacher</small>
          </div>
        </div>
        <div className="side-menu">
          <a className={activeTab === 'overview' ? 'side-active' : ''} onClick={() => handleNav('overview', 'overview')}>Overview</a>
          <a className={activeTab === 'lessons' ? 'side-active' : ''} onClick={() => handleNav('lessons', 'lessons')}>My lessons</a>
          <a className={activeTab === 'live' ? 'side-active' : ''} onClick={() => handleNav('live', 'live')}>Live sessions</a>
          <a className={activeTab === 'students' ? 'side-active' : ''} onClick={() => handleNav('students', 'students')}>Students</a>
          <a className={activeTab === 'submissions' ? 'side-active' : ''} onClick={() => handleNav('submissions', 'submissions')}>Assessments</a>
        </div>
        <button className="logout" onClick={onLogout}>← Log out</button>
      </aside>
      <section className="teacher-main">
        <header className="teacher-header" id="overview">
          <div>
            <p className="eyebrow"><span /> TEACHER DASHBOARD</p>
            <h1>Good morning, <i>Chaheed</i> ✦</h1>
            <p>Here’s what is happening in your classroom today.</p>
          </div>
          <button className="create-btn" onClick={() => setShowLessonModal(true)}>
            <Icon name="plus" /> Create lesson
          </button>
        </header>
        <div className="teacher-stats" id="lessons">
          <article>
            <span className="stat-icon peach"><Icon name="users" /></span>
            <div>
              <b>{studentCount}</b>
              <p>Active students</p>
            </div>
            <small>Database synced</small>
          </article>
          <article>
            <span className="stat-icon lavender"><Icon name="book" /></span>
            <div>
              <b>{lessons.length}</b>
              <p>Published lessons</p>
            </div>
            <small>Database synced</small>
          </article>
          <article>
            <span className="stat-icon yellow"><Icon name="check" /></span>
            <div>
              <b>{toGradeCount}</b>
              <p>To grade</p>
            </div>
            <small className="urgent">Due today</small>
          </article>
        </div>
        <div className="teacher-grid" id="live">
          <article className="post-panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow"><span /> SHARE WITH STUDENTS</p>
                <h2>Post an <i>announcement</i></h2>
              </div>
              <span className="pin">✦</span>
            </div>
            <form onSubmit={publish}>
              <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a warm update for your students…" />
              <div>
                <button disabled={busy} className="publish">{busy ? 'Publishing...' : 'Publish now'} <Icon name="arrow" size={16} /></button>
              </div>
            </form>
            <div className="last-post">
              <span>LAST POST</span>
              <p>{notice}</p>
              <small>Visible to BAC & BEM students</small>
            </div>
          </article>
          <article className="schedule-panel">
            <div className="panel-title">
              <div>
                <p className="eyebrow"><span /> UPCOMING</p>
                <h2>Live <i>sessions</i></h2>
              </div>
              <button onClick={() => setShowSessionModal(true)} className="circle-add"><Icon name="plus" size={16} /></button>
            </div>
            {sessions.length === 0 ? (
              <p style={{ padding: '20px 0', color: '#7c7379', fontStyle: 'italic', fontSize: '11px' }}>No live sessions scheduled yet.</p>
            ) : (
              sessions.map(sess => {
                const sDate = new Date(sess.session_date);
                const day = sDate.getDate();
                const month = sDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const formattedTime = sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const dayName = sDate.toLocaleString('en-US', { weekday: 'long' });
                const catClass = sess.level === 'BAC' ? '' : 'purple';
                return (
                  <div className="schedule-item" key={sess.id}>
                    <div className={`date-box ${catClass}`}><b>{day}</b><small>{month}</small></div>
                    <div>
                      <b>{sess.level} · {sess.title}</b>
                      <p>{dayName} · {formattedTime} · <a href={sess.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#7e639f', fontWeight: '600' }}>Join Meeting</a></p>
                    </div>
                  </div>
                );
              })
            )}
          </article>
        </div>

        <section className="submissions" id="students" style={{ marginTop: '16px' }}>
          <div className="panel-title">
            <div>
              <p className="eyebrow"><span /> MEMBERS</p>
              <h2>Manage <i>students</i></h2>
            </div>
            <button onClick={() => {
              const inviteLink = window.location.origin;
              navigator.clipboard.writeText(inviteLink);
              pop('Share link copied to clipboard!');
            }} className="create-btn" style={{ padding: '8px 12px', fontSize: '10px' }}>
              + Invite student
            </button>
          </div>
          {students.length === 0 ? (
            <p style={{ padding: '20px 0', color: '#7c7379', fontStyle: 'italic', fontSize: '11px' }}>No students registered yet.</p>
          ) : (
            students.map(st => {
              const remaining = Math.max(0, (st.total_due || 0) - (st.amount_paid || 0));
              const statusColor = st.payment_status === 'Paid' ? '#4da64d' : st.payment_status === 'Partially Paid' ? '#e68212' : '#ce6887';
              return (
                <div className="student-row" key={st.id} style={{ gridTemplateColumns: '36px 1.5fr 1fr 1fr 1fr auto' }}>
                  <span className="student-avatar">{st.full_name?.substring(0, 2).toUpperCase() || 'ST'}</span>
                  <div>
                    <b>{st.full_name || 'Anonymous Student'}</b>
                    <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#7c7379' }}>Joined {new Date(st.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <small style={{ color: '#7c7379' }}>Paid</small>
                    <p style={{ fontSize: '12px', fontWeight: '600', margin: '2px 0 0' }}>{st.amount_paid ?? 0} DA</p>
                  </div>
                  <div>
                    <small style={{ color: '#7c7379' }}>Remaining</small>
                    <p style={{ fontSize: '12px', fontWeight: '600', margin: '2px 0 0', color: remaining > 0 ? '#ad5974' : '#7c7379' }}>{remaining} DA</p>
                  </div>
                  <div>
                    <small style={{ color: '#7c7379' }}>Status</small>
                    <p style={{ fontSize: '11px', fontWeight: '700', margin: '2px 0 0', color: statusColor }}>{st.payment_status}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditingStudent(st)} style={{ background: '#f0ebfb', color: '#725a98' }}>Edit</button>
                    <button onClick={() => handleRemoveStudent(st.id)} style={{ background: '#fff0f2', color: '#ce6887' }}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="submissions" id="submissions" style={{ marginTop: '16px' }}>
          <div className="panel-title">
            <div>
              <p className="eyebrow"><span /> ASSIGNMENTS</p>
              <h2>Active <i>assessments</i></h2>
            </div>
            <button onClick={() => setShowAssessmentModal(true)} className="create-btn" style={{ padding: '8px 12px', fontSize: '10px' }}>
              + Create assessment
            </button>
          </div>
          {assessments.length === 0 ? (
            <p style={{ padding: '20px 0', color: '#7c7379', fontStyle: 'italic', fontSize: '11px' }}>No assessments created yet.</p>
          ) : (
            assessments.map(ass => (
              <div className="student-row" key={ass.id} style={{ gridTemplateColumns: '36px 2.5fr 2fr auto' }}>
                <div className="paper" style={{ width: '32px', height: '36px', padding: '6px', fontSize: '14px' }}>A</div>
                <div>
                  <b>{ass.title}</b>
                  <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#7c7379' }}>{ass.description || 'No description'}</p>
                </div>
                <small style={{ color: new Date(ass.deadline) < new Date() ? '#ce6887' : '#78a080', fontWeight: '600' }}>
                  Deadline: {new Date(ass.deadline).toLocaleString()}
                </small>
                <button onClick={() => handleDeleteAssessment(ass.id)} style={{ background: '#fff0f2', color: '#ce6887' }}>Delete</button>
              </div>
            ))
          )}
        </section>

        <section className="submissions" style={{ marginTop: '16px' }}>
          <div className="panel-title">
            <div>
              <p className="eyebrow"><span /> SUBMISSIONS</p>
              <h2>Latest <i>submissions</i></h2>
            </div>
          </div>
          {submissions.length === 0 ? (
            <p style={{ padding: '20px 0', color: '#7c7379', fontStyle: 'italic', fontSize: '11px' }}>No submissions received yet.</p>
          ) : (
            submissions.map(sub => (
              <div className="student-row" key={sub.id}>
                <span className="student-avatar">{sub.profiles?.full_name?.substring(0, 2).toUpperCase() || 'ST'}</span>
                <b>{sub.profiles?.full_name || 'Student'}</b>
                <span>{sub.assessment_name}</span>
                <small>{sub.status === 'Graded' ? `Graded: ${sub.grade}` : 'Pending'}</small>
                {sub.status === 'Pending' ? (
                  <button onClick={() => setActiveSubmission(sub)}>Review & Grade</button>
                ) : (
                  <button style={{ background: '#eafbe9', color: '#4da64d' }} onClick={() => window.open(sub.file_url, '_blank')}>View Link</button>
                )}
              </div>
            ))
          )}
        </section>
      </section>
      <LessonModal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)} onSaved={loadDashboardData} />
      <SessionModal isOpen={showSessionModal} onClose={() => setShowSessionModal(false)} onSaved={loadDashboardData} />
      <AssessmentModal isOpen={showAssessmentModal} onClose={() => setShowAssessmentModal(false)} onSaved={loadDashboardData} />
      <GradeModal isOpen={!!activeSubmission} onClose={() => setActiveSubmission(null)} submission={activeSubmission} onSaved={loadDashboardData} />
      <EditStudentModal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} student={editingStudent} onSaved={loadDashboardData} />
      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}
    </main>
  );
}

function Home({ onLogin }) {
  const [notice, setNotice] = useState('🌷 Welcome back! Check back later for the latest announcement.');
  const [lessons, setLessons] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [toast, setToast] = useState('');

  const pop = m => { setToast(m); setTimeout(() => setToast(''), 2200) };

  useEffect(() => {
    supabase.from('announcements').select('content').order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data?.content) setNotice(data.content);
    });
    supabase.from('lessons').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setLessons(data);
    });
    supabase.from('sessions').select('*').gte('session_date', new Date().toISOString()).order('session_date', { ascending: true }).limit(1).maybeSingle().then(({ data }) => {
      if (data) setNextSession(data);
    });
  }, []);

  return (
    <main>
      <nav>
        <Brand />
        <div className="navlinks">
          <a>Home</a>
          <a href="#lessons">Lessons</a>
          <a href="#sessions">Live sessions</a>
        </div>
        <button className="sign-in" onClick={() => onLogin('student', '')}>Student sign in <Icon name="arrow" size={16} /></button>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> YOUR ENGLISH JOURNEY STARTS HERE</p>
          <div className="doodle-arrow">dream big ↗</div>
          <h1>Speak it.<br /><i>Own</i> it. <span>☆</span></h1>
          <p className="type-line">Let’s make English feel <TextType text={['easy & exciting.', 'confident & clear.', 'uniquely yours.']} textColors={['#cf6285', '#7654bb', '#e27855']} /></p>
          <p className="intro">A bright, supportive space for BEM & BAC students to learn, grow, and shine in English.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => onLogin('student', '')}>Enter student space <Icon name="arrow" /></button>
            <button className="textbutton" onClick={() => onLogin('teacher', '')}>I’m a teacher</button>
          </div>
        </div>
        <div className="hero-art">
          <div className="blob pink" />
          <div className="blob lavender" />
          <div className="sticker sticker-heart">♡</div>
          <div className="sticker sticker-star">✦</div>
          <div className="english-card">
            <div className="card-top"><span>ENGLISH CLASS</span><span>♡</span></div>
            <h3>Future<br /><i>fluent</i><br />speaker.</h3>
            <div className="girl">
              <div className="hair" />
              <div className="face">• ◡ •</div>
              <div className="body" />
            </div>
            <p>one lesson at a time</p>
          </div>
          <div className="floating-note"><span>✦</span><b>You’ve got this!</b></div>
        </div>
      </section>
      <section className="dashboard" id="sessions">
        <div className="dash-head">
          <div>
            <p className="eyebrow"><span /> A PEEK INSIDE</p>
            <h2>Your learning <i>home</i></h2>
          </div>
        </div>
        <div className="cards">
          <article className="announce">
            <div className="label"><span className="pinkdot" /> LATEST ANNOUNCEMENT</div>
            <h3>{notice}</h3>
            <small>Updated from database</small>
          </article>
          <article className="session">
            <div className="label"><Icon name="calendar" size={15} /> NEXT LIVE SESSION</div>
            {nextSession ? (
              <>
                <span className="level">{nextSession.level} 2026</span>
                <h3>{nextSession.title}</h3>
                <div className="session-time">
                  <div>
                    <b>{new Date(nextSession.session_date).getDate()}</b>
                    <span>{new Date(nextSession.session_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                  </div>
                  <p>
                    <b>{new Date(nextSession.session_date).toLocaleString('en-US', { weekday: 'long' })} · {new Date(nextSession.session_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</b>
                    <br /><small>Google Meet</small>
                  </p>
                </div>
                <button className="join" onClick={() => window.open(nextSession.meeting_link, '_blank')}>Join session <Icon name="arrow" size={16} /></button>
              </>
            ) : (
              <p style={{ margin: '30px 0', fontSize: '13px', color: '#7c7379', fontStyle: 'italic' }}>No upcoming sessions scheduled yet.</p>
            )}
          </article>
          <article className="assessment">
            <div className="label"><span className="purple-dot" /> DUE SOON</div>
            <div className="assess-title">
              <div className="paper">A<small>+</small></div>
              <div>
                <h3>Assessment #3</h3>
                <p>Reading comprehension</p>
              </div>
            </div>
            <div className="deadline"><Icon name="clock" size={16} /><span>Due in <b>2 days, 4 hours</b></span></div>
            <button className="submit" onClick={() => pop('Sign in to submit your work.')}>Submit my work <Icon name="arrow" size={16} /></button>
          </article>
        </div>
      </section>
      <section className="lessons" id="lessons">
        <div className="lessons-title">
          <p className="eyebrow"><span /> LEARN AT YOUR PACE</p>
          <h2>Pick up where you <i>left off</i></h2>
        </div>
        <div className="lesson-grid">
          {lessons.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#7c7379', fontStyle: 'italic' }}>No lessons have been added yet.</p>
          ) : (
            lessons.map((lesson, i) => {
              const catClass = lesson.category.toLowerCase().includes('vocab') ? 'vocab' : lesson.category.toLowerCase().includes('gram') ? 'grammar' : 'writing';
              const labelText = lesson.category.toLowerCase().includes('vocab') ? 'WORD POWER' : lesson.category.toLowerCase().includes('gram') ? 'GRAMMAR GLOW UP' : 'WRITE WITH ME';
              const quoteText = lesson.category.toLowerCase().includes('vocab') ? 'say it loud' : lesson.category.toLowerCase().includes('gram') ? 'you got this' : 'your voice matters';
              return (
                <article key={lesson.id}>
                  <div className={`lesson-image ${catClass}`}>
                    <span>0{i + 1}</span>
                    <b>{labelText}</b>
                    <em>{quoteText}</em>
                  </div>
                  <p className="course">{lesson.level} · {lesson.category}</p>
                  <h3>{lesson.title}</h3>
                  <div className="lesson-foot">
                    <span>{lesson.duration_minutes} min · Video lesson</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {lesson.file_url && (
                        <a href={lesson.file_url} target="_blank" rel="noopener noreferrer" style={{ background: '#ece7f8', color: '#7660a2', borderRadius: '50%', width: '29px', height: '29px', display: 'grid', placeItems: 'center', fontSize: '12px', textDecoration: 'none' }}>📎</a>
                      )}
                      <button onClick={() => onLogin('student', '')}><Icon name="play" size={16} /></button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
      <footer>
        <Brand />
        <p>Made with care for curious minds ♡</p>
      </footer>
      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}
    </main>
  );
}

function StudentPortal({ onLogout, user, profile }) {
  const [notice, setNotice] = useState('🌷 Welcome back! Check back later for announcements.');
  const [lessons, setLessons] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [nextAssessment, setNextAssessment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('space');

  const pop = m => { setToast(m); setTimeout(() => setToast(''), 2500) };

  const handleNav = (tab, id) => {
    setActiveTab(tab);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadStudentData = async () => {
    const { data: annData } = await supabase.from('announcements').select('content').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (annData?.content) setNotice(annData.content);

    const { data: lessonData } = await supabase.from('lessons').select('*').order('created_at', { ascending: false });
    if (lessonData) setLessons(lessonData);

    const { data: sessData } = await supabase.from('sessions').select('*').gte('session_date', new Date().toISOString()).order('session_date', { ascending: true }).limit(1).maybeSingle();
    if (sessData) setNextSession(sessData);

    const { data: assList } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
    if (assList) setAssessments(assList);

    const { data: nextAss } = await supabase.from('assessments').select('*').gte('deadline', new Date().toISOString()).order('deadline', { ascending: true }).limit(1).maybeSingle();
    if (nextAss) setNextAssessment(nextAss);

    if (user) {
      const { data: subData } = await supabase.from('submissions').select('*').eq('student_id', user.id).order('submitted_at', { ascending: false });
      if (subData) setSubmissions(subData);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const studentName = profile?.full_name || 'Student';

  return (
    <main className="student-page">
      <aside className="student-sidebar">
        <Brand />
        <div className="student-profile">
          <span>SA</span>
          <div>
            <b>{studentName}</b>
            <small>BAC 2026 student</small>
          </div>
        </div>
        <div className="side-menu">
          <a className={activeTab === 'space' ? 'side-active' : ''} onClick={() => handleNav('space', 'space')}>My space</a>
          <a className={activeTab === 'lessons' ? 'side-active' : ''} onClick={() => handleNav('lessons', 'lessons')}>My lessons</a>
          <a className={activeTab === 'live' ? 'side-active' : ''} onClick={() => handleNav('live', 'live')}>Live sessions</a>
          <a className={activeTab === 'assessments' ? 'side-active' : ''} onClick={() => handleNav('assessments', 'assessments')}>My assessments</a>
        </div>
        <button className="logout" onClick={onLogout}>← Log out</button>
      </aside>
      <section className="student-main">
        <header className="student-header" id="space">
          <div>
            <p className="eyebrow"><span /> STUDENT PORTAL</p>
            <h1>Hello, <i>{studentName}</i> ✦</h1>
            <p>Your next small step is waiting for you.</p>
          </div>
          <div className="progress-ring"><b>68%</b><span>this week</span></div>
        </header>

        {profile && (
          <section className="student-live" style={{ background: '#fbfcfc', border: '1.5px solid #eef2f2', marginTop: '16px' }}>
            <div>
              <p className="eyebrow"><span style={{ background: '#78a0a0' }} /> TUITION & PAYMENT STATUS</p>
              <h2>Status: <span style={{ color: profile.payment_status === 'Paid' ? '#4da64d' : profile.payment_status === 'Partially Paid' ? '#e68212' : '#ce6887' }}>{profile.payment_status}</span></h2>
              <p style={{ marginTop: '6px', fontSize: '13px' }}>
                Paid: <b>{profile.amount_paid ?? 0} DA</b> / {profile.total_due ?? 5000} DA 
                {profile.payment_status !== 'Paid' && ` (Remaining: ${Math.max(0, (profile.total_due ?? 5000) - (profile.amount_paid ?? 0))} DA)`}
              </p>
            </div>
            <div className="live-date" style={{ background: '#ecf3f3', border: '1px solid #dbe8e8', color: '#557878', display: 'grid', placeItems: 'center', height: '60px', width: '90px' }}>
              <b style={{ fontSize: '18px' }}>{profile.payment_status === 'Paid' ? '0' : Math.max(0, (profile.total_due ?? 5000) - (profile.amount_paid ?? 0))}</b>
              <small style={{ fontSize: '9px', textTransform: 'uppercase', color: '#557878' }}>DA Left</small>
            </div>
          </section>
        )}

        <section className="student-live" id="live" style={{ marginTop: '20px' }}>
          {nextSession ? (
            <>
              <div>
                <p className="eyebrow"><span /> NEXT LIVE CLASS</p>
                <h2>{nextSession.title}</h2>
                <p>{new Date(nextSession.session_date).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · {new Date(nextSession.session_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <button onClick={() => window.open(nextSession.meeting_link, '_blank')} className="join">Join live session <Icon name="arrow" size={16} /></button>
              </div>
              <div className="live-date">
                <b>{new Date(nextSession.session_date).getDate()}</b>
                <span>{new Date(nextSession.session_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>
                <small>{nextSession.level}</small>
              </div>
            </>
          ) : (
            <div>
              <p className="eyebrow"><span /> NEXT LIVE CLASS</p>
              <h2>No live classes scheduled yet.</h2>
              <p>Keep an eye out for updates from teacher Chaheed!</p>
            </div>
          )}
        </section>
        <div className="student-grid" id="assessments">
          <article className="student-announcement">
            <p className="eyebrow"><span /> FROM CHAHEED</p>
            <h2>{notice}</h2>
            <small>Posted in database</small>
          </article>
          <article className="work-card">
            <p className="eyebrow"><span /> WORK TO SUBMIT</p>
            {nextAssessment ? (
              <>
                <div className="work-top">
                  <div className="paper">A<small>+</small></div>
                  <div>
                    <h2>{nextAssessment.title}</h2>
                    <p>{nextAssessment.description || 'Instructions inside modal'}</p>
                    {nextAssessment.file_url && (
                      <p style={{ marginTop: '8px', fontSize: '11px' }}>
                        <a href={nextAssessment.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#765c98', fontWeight: '700', textDecoration: 'none' }}>📎 Download Materials / Instructions</a>
                      </p>
                    )}
                  </div>
                </div>
                <p className="due" style={{ color: '#ad5974', fontWeight: '600' }}>
                  Due by: {new Date(nextAssessment.deadline).toLocaleString()}
                </p>
                <button onClick={() => setShowSubmitModal(true)} className="submit-work">Submit my work <Icon name="arrow" size={16}/></button>
              </>
            ) : (
              <>
                <div className="work-top">
                  <div className="paper">A<small>+</small></div>
                  <div>
                    <h2>No active assessments</h2>
                    <p>You are all caught up! Good job.</p>
                  </div>
                </div>
                <p className="due">Enjoy your day!</p>
              </>
            )}
          </article>
        </div>
        <section className="continue-section" style={{ marginTop: '16px' }}>
          <div className="panel-title">
            <div>
              <p className="eyebrow"><span /> MY SUBMISSIONS</p>
              <h2>Your graded & pending <i>assessments</i></h2>
            </div>
          </div>
          {submissions.length === 0 ? (
            <p style={{ padding: '15px 0', color: '#7c7379', fontStyle: 'italic', fontSize: '12px' }}>You haven't submitted any assessments yet.</p>
          ) : (
            submissions.map(sub => (
              <div className="student-lesson-row" key={sub.id} style={{ borderTop: '1px solid #f0eae6', marginTop: '15px', paddingTop: '12px' }}>
                <div className="tiny-cover" style={{ background: sub.status === 'Graded' ? '#eafbe9' : '#fff0f2', color: sub.status === 'Graded' ? '#4da64d' : '#ce6887', display: 'grid', placeItems: 'center', fontWeight: '700' }}>
                  {sub.status === 'Graded' ? sub.grade : '...'}
                </div>
                <div>
                  <b>{sub.assessment_name}</b>
                  <p>Submitted on {new Date(sub.submitted_at).toLocaleDateString()} · Status: <span style={{ color: sub.status === 'Graded' ? '#4da64d' : '#e68212', fontWeight: '600' }}>{sub.status}</span></p>
                </div>
                <button onClick={() => window.open(sub.file_url, '_blank')}><Icon name="play" size={17} /></button>
              </div>
            ))
          )}
        </section>
        <section className="continue-section" id="lessons" style={{ marginTop: '16px' }}>
          <div className="panel-title">
            <div>
              <p className="eyebrow"><span /> CONTINUE LEARNING</p>
              <h2>Pick up where you <i>left off</i></h2>
            </div>
            <button onClick={() => pop('Your full lesson library is ready.')} className="view-all">View all lessons <Icon name="arrow" size={15} /></button>
          </div>
          {lessons.length === 0 ? (
            <p style={{ padding: '20px 0', color: '#7c7379', fontStyle: 'italic', fontSize: '12px' }}>No lessons added yet.</p>
          ) : (
            lessons.slice(0, 3).map(lesson => (
              <div className="student-lesson-row" key={lesson.id}>
                <div className="tiny-cover">{lesson.category.substring(0, 2)}</div>
                <div>
                  <b>{lesson.title}</b>
                  <p>{lesson.level} · {lesson.category} · {lesson.duration_minutes} min video</p>
                  <div className="progress-bar"><span /></div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {lesson.file_url && (
                    <a href={lesson.file_url} target="_blank" rel="noopener noreferrer" style={{ background: '#f4edff', color: '#765c98', padding: '6px 10px', borderRadius: '3px', fontSize: '10px', fontWeight: '600', textDecoration: 'none' }}>Materials 📎</a>
                  )}
                  <button onClick={() => pop('Opening your lesson…')}><Icon name="play" size={17} /></button>
                </div>
              </div>
            ))
          )}
        </section>
      </section>
      <SubmissionModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} studentId={user?.id} assessments={assessments} onSaved={loadStudentData} />
      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}
    </main>
  );
}

function RealLogin({ onBack, initialMode = 'signin', teacherEntry = false, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: 'https://english-with-chahed.vercel.app'
        }
      });
      if (!result.error) setMessage('Account created. Check your email to confirm it, then sign in.');
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (!result.error) onAuthenticated(result.data.user);
    }
    setBusy(false);
    if (result.error) setMessage(result.error.message);
  };

  return (
    <main className="login-page">
      <button className="back-home" onClick={onBack}>← Back to home</button>
      <div className="login-art">
        <Brand />
        <span className="login-spark spark-one">✦</span>
        <span className="login-spark spark-two">✧</span>
        <span className="login-spark spark-three">★</span>
        <div className="quote-mark">“</div>
        <h1>Small steps.<br /><i>Brave</i> voices.</h1>
        <p>A happy place to learn English, one confident sentence at a time.</p>
        <div className="art-circle">ABC<br /><small>YOU CAN DO IT!</small></div>
      </div>
      <section className="login-card">
        <p className="eyebrow"><span /> {teacherEntry ? 'CHAHEED’S TEACHER SPACE' : 'STUDENT SPACE'}</p>
        <h2>{mode === 'signup' ? <>Create your <i>account</i></> : <>Welcome <i>back</i></>}</h2>
        <p className="login-sub">{teacherEntry ? 'Only Chaheed’s approved teacher email can access this portal.' : 'Sign in to access lessons, live sessions, and your submitted work.'}</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>Full name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></label>}
          <label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com" /></label>
          <label>Password<input required minLength="6" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
          {message && <p className="auth-message">{message}</p>}
          <button disabled={busy} className="login-submit">{busy ? 'Please wait…' : mode === 'signup' ? 'Create student account' : 'Sign in securely'} <Icon name="arrow" /></button>
        </form>
        {!teacherEntry && <p className="new-account">{mode === 'signup' ? 'Already have an account? ' : 'New here? '}<a onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage('') }}>{mode === 'signup' ? 'Sign in' : 'Create a student account'}</a></p>}
        <small className="demo-note">Your login is protected by Supabase authentication.</small>
      </section>
    </main>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const routeUser = async userObj => {
    setUser(userObj);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userObj.id).maybeSingle();
      setProfile(data);
      setView(data?.role === 'teacher' ? 'teacher' : 'student');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        routeUser(session.user);
      } else {
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        routeUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setView('home');
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setView('home');
  };

  const login = r => setView(r === 'teacher' ? 'login-teacher' : 'login-student');

  if (loading) return <div className="app-loader">Loading English with Chaheed…</div>;

  return view === 'login-teacher' ? (
    <RealLogin teacherEntry onAuthenticated={routeUser} onBack={() => setView('home')} />
  ) : view === 'login-student' ? (
    <RealLogin onAuthenticated={routeUser} onBack={() => setView('home')} />
  ) : view === 'teacher' ? (
    <TeacherDashboard onLogout={logout} />
  ) : view === 'student' ? (
    <StudentPortal onLogout={logout} user={user} profile={profile} />
  ) : (
    <Home onLogin={login} />
  );
}

createRoot(document.getElementById('root')).render(<App />);
