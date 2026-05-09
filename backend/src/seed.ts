import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './lib/prisma';

const PASSWORD = 'Demo1234!';

async function main() {
  console.log('Seeding database…');

  const hash = await bcrypt.hash(PASSWORD, 12);

  // ─── Users ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@metu.edu.tr' },
    update: {},
    create: {
      email: 'admin@metu.edu.tr',
      passwordHash: hash,
      role: 'ADMIN',
      name: 'System Admin',
      institution: 'METU',
      isVerified: true,
    },
  });

  const doctor1 = await prisma.user.upsert({
    where: { email: 'doctor1@hacettepe.edu.tr' },
    update: {
      bio: 'Cardiologist with 12 years of clinical experience at Hacettepe University Hospital. Focused on digital health innovations to improve early diagnosis of arrhythmias and heart failure.',
      specialization: 'Interventional Cardiology, Arrhythmia Management, Digital Biomarkers',
      education: 'MD — Hacettepe University Faculty of Medicine (2008)\nFellowship in Interventional Cardiology — Istanbul Heart Institute (2012)\nCertificate in Clinical AI — Johns Hopkins Online (2022)',
      interests: 'AI-assisted ECG interpretation, wearable cardiac monitors, federated learning in clinical settings, real-world evidence studies',
    },
    create: {
      email: 'doctor1@hacettepe.edu.tr',
      passwordHash: hash,
      role: 'HEALTHCARE',
      name: 'Dr. Ayşe Kaya',
      institution: 'Hacettepe University',
      isVerified: true,
      bio: 'Cardiologist with 12 years of clinical experience at Hacettepe University Hospital. Focused on digital health innovations to improve early diagnosis of arrhythmias and heart failure.',
      specialization: 'Interventional Cardiology, Arrhythmia Management, Digital Biomarkers',
      education: 'MD — Hacettepe University Faculty of Medicine (2008)\nFellowship in Interventional Cardiology — Istanbul Heart Institute (2012)\nCertificate in Clinical AI — Johns Hopkins Online (2022)',
      interests: 'AI-assisted ECG interpretation, wearable cardiac monitors, federated learning in clinical settings, real-world evidence studies',
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'doctor2@istanbul.edu.tr' },
    update: {
      bio: 'Ophthalmologist and researcher specializing in retinal diseases. Leading the diabetic retinopathy screening program at Istanbul University Hospital, exploring deep learning for early-stage detection.',
      specialization: 'Medical Retina, Diabetic Eye Disease, Fundus Imaging',
      education: 'MD — Istanbul University Cerrahpaşa Faculty of Medicine (2010)\nSpecialization in Ophthalmology — Istanbul Training Hospital (2015)\nMSc Medical Imaging — University of Edinburgh (2018)',
      interests: 'Retinal image analysis, explainable AI in ophthalmology, population screening tools, transfer learning with limited clinical datasets',
    },
    create: {
      email: 'doctor2@istanbul.edu.tr',
      passwordHash: hash,
      role: 'HEALTHCARE',
      name: 'Dr. Mehmet Demir',
      institution: 'Istanbul University',
      isVerified: true,
      bio: 'Ophthalmologist and researcher specializing in retinal diseases. Leading the diabetic retinopathy screening program at Istanbul University Hospital, exploring deep learning for early-stage detection.',
      specialization: 'Medical Retina, Diabetic Eye Disease, Fundus Imaging',
      education: 'MD — Istanbul University Cerrahpaşa Faculty of Medicine (2010)\nSpecialization in Ophthalmology — Istanbul Training Hospital (2015)\nMSc Medical Imaging — University of Edinburgh (2018)',
      interests: 'Retinal image analysis, explainable AI in ophthalmology, population screening tools, transfer learning with limited clinical datasets',
    },
  });

  const eng1 = await prisma.user.upsert({
    where: { email: 'eng1@metu.edu.tr' },
    update: {
      bio: 'ML engineer and PhD candidate at METU Computer Engineering. Building end-to-end biosignal processing pipelines. Passionate about translating research-grade AI into clinical-grade tools.',
      specialization: 'Machine Learning, Signal Processing, Embedded Systems, MLOps',
      education: 'BSc Computer Engineering — METU (2018)\nMSc Artificial Intelligence — METU (2020)\nPhD (ongoing) — Biomedical Signal Processing, METU',
      interests: 'ECG/EEG deep learning, federated learning, real-time inference on edge devices, clinical AI validation frameworks',
    },
    create: {
      email: 'eng1@metu.edu.tr',
      passwordHash: hash,
      role: 'ENGINEER',
      name: 'Emre Yıldız',
      institution: 'METU',
      isVerified: true,
      bio: 'ML engineer and PhD candidate at METU Computer Engineering. Building end-to-end biosignal processing pipelines. Passionate about translating research-grade AI into clinical-grade tools.',
      specialization: 'Machine Learning, Signal Processing, Embedded Systems, MLOps',
      education: 'BSc Computer Engineering — METU (2018)\nMSc Artificial Intelligence — METU (2020)\nPhD (ongoing) — Biomedical Signal Processing, METU',
      interests: 'ECG/EEG deep learning, federated learning, real-time inference on edge devices, clinical AI validation frameworks',
    },
  });

  const eng2 = await prisma.user.upsert({
    where: { email: 'eng2@boun.edu.tr' },
    update: {
      bio: 'Biomedical engineer specializing in medical device prototyping and computer vision for clinical imaging. 4 years experience building FDA-pathway-aware products at the intersection of hardware and AI.',
      specialization: 'Computer Vision, Medical Device Design, RFID/IoT, Regulatory (FDA/CE)',
      education: 'BSc Biomedical Engineering — Boğaziçi University (2017)\nMSc Bioengineering — ETH Zürich (2019)',
      interests: 'Surgical robotics, OR workflow optimization, point-of-care diagnostics, regulatory science for AI/ML medical devices',
    },
    create: {
      email: 'eng2@boun.edu.tr',
      passwordHash: hash,
      role: 'ENGINEER',
      name: 'Selin Arslan',
      institution: 'Boğaziçi University',
      isVerified: true,
      bio: 'Biomedical engineer specializing in medical device prototyping and computer vision for clinical imaging. 4 years experience building FDA-pathway-aware products at the intersection of hardware and AI.',
      specialization: 'Computer Vision, Medical Device Design, RFID/IoT, Regulatory (FDA/CE)',
      education: 'BSc Biomedical Engineering — Boğaziçi University (2017)\nMSc Bioengineering — ETH Zürich (2019)',
      interests: 'Surgical robotics, OR workflow optimization, point-of-care diagnostics, regulatory science for AI/ML medical devices',
    },
  });

  console.log('✓ Users created (5)');

  // ─── Posts ────────────────────────────────────────────────────────────────
  const post1 = await prisma.post.upsert({
    where: { id: 'seed-post-1' },
    update: {},
    create: {
      id: 'seed-post-1',
      title: 'AI-Powered ECG Anomaly Detection',
      domain: 'Cardiology',
      description:
        'We need an ML engineer to build a real-time CNN model that identifies arrhythmia patterns in continuous ECG streams. The model must achieve >95% sensitivity and integrate with our hospital monitoring system.',
      requiredExpertise: 'Machine Learning, Signal Processing, Python',
      projectStage: 'CONCEPT_VALIDATION',
      confidentiality: 'PUBLIC',
      city: 'Ankara',
      country: 'Turkey',
      commitmentLevel: '20 hours/week for 6 months',
      status: 'ACTIVE',
      ownerId: doctor1.id,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: 'seed-post-2' },
    update: {},
    create: {
      id: 'seed-post-2',
      title: 'Smart Surgical Instrument Tracking System',
      domain: 'Medical Devices',
      description:
        'Looking for healthcare partners to validate an RFID-based surgical instrument tracking prototype. We need clinical feedback and access to OR workflow data.',
      requiredExpertise: 'OR workflow, Surgical safety protocols',
      projectStage: 'PROTOTYPE',
      confidentiality: 'MEETING_ONLY',
      city: 'Istanbul',
      country: 'Turkey',
      commitmentLevel: '10 hours/week for 3 months',
      status: 'ACTIVE',
      ownerId: eng1.id,
    },
  });

  await prisma.post.upsert({
    where: { id: 'seed-post-3' },
    update: {},
    create: {
      id: 'seed-post-3',
      title: 'NLP Model for Patient Triage Notes',
      domain: 'Emergency Medicine',
      description:
        'Building an NLP pipeline to extract clinical urgency signals from freetext ER triage notes. Looking for ER physicians with annotation expertise.',
      requiredExpertise: 'Clinical NLP, Emergency Medicine knowledge',
      projectStage: 'IDEA',
      confidentiality: 'PUBLIC',
      city: 'Ankara',
      country: 'Turkey',
      commitmentLevel: '5 hours/week',
      status: 'DRAFT',
      ownerId: eng2.id,
    },
  });

  const post4 = await prisma.post.upsert({
    where: { id: 'seed-post-4' },
    update: {},
    create: {
      id: 'seed-post-4',
      title: 'Retinal Scan Diabetic Retinopathy Screening',
      domain: 'Ophthalmology',
      description:
        'Deep learning model for automated diabetic retinopathy grading from fundus images. Engineering partner matched — meeting scheduled.',
      requiredExpertise: 'Computer Vision, Ophthalmology dataset expertise',
      projectStage: 'PILOT_TESTING',
      confidentiality: 'PUBLIC',
      city: 'Istanbul',
      country: 'Turkey',
      commitmentLevel: '15 hours/week for 4 months',
      status: 'MEETING_SCHEDULED',
      ownerId: doctor2.id,
    },
  });

  await prisma.post.upsert({
    where: { id: 'seed-post-5' },
    update: {},
    create: {
      id: 'seed-post-5',
      title: 'Wearable Glucose Monitoring Alert System',
      domain: 'Endocrinology',
      description:
        'Successfully matched and closed. Partner found for continuous glucose monitoring alert integration.',
      requiredExpertise: 'IoT, BLE, Mobile Development',
      projectStage: 'PRE_DEPLOYMENT',
      confidentiality: 'PUBLIC',
      city: 'Ankara',
      country: 'Turkey',
      commitmentLevel: 'Full-time 6 months',
      status: 'CLOSED',
      ownerId: doctor1.id,
    },
  });

  console.log('✓ Posts created (5)');

  // ─── Meeting Requests ─────────────────────────────────────────────────────
  await prisma.meetingRequest.upsert({
    where: { id: 'seed-meeting-1' },
    update: {},
    create: {
      id: 'seed-meeting-1',
      postId: post4.id,
      requesterId: eng2.id,
      postOwnerId: doctor2.id,
      status: 'CONFIRMED',
      message: 'Very interested in collaborating on the retinal scan project.',
      ndaAccepted: true,
      ndaAcceptedAt: new Date('2026-04-01'),
      confirmedSlot: { date: '2026-05-10', time: '14:00' },
    },
  });

  await prisma.meetingRequest.upsert({
    where: { id: 'seed-meeting-2' },
    update: {},
    create: {
      id: 'seed-meeting-2',
      postId: post1.id,
      requesterId: eng1.id,
      postOwnerId: doctor1.id,
      status: 'CONFIRMED',
      message: 'I have experience with ECG signal processing. Would love to help.',
      ndaAccepted: true,
      ndaAcceptedAt: new Date('2026-04-15'),
      confirmedSlot: { date: '2026-05-12', time: '10:00' },
      meetingLink: 'https://meet.google.com/demo-ecg-meeting',
    },
  });

  // Seed: a few chat messages for the CONFIRMED meetings so chat loads with content
  const existingMsg1 = await prisma.message.findFirst({ where: { meetingId: 'seed-meeting-1' } });
  if (!existingMsg1) {
    await prisma.message.createMany({
      data: [
        { meetingId: 'seed-meeting-1', senderId: doctor2.id, content: 'Merhaba, projeye katılım için heyecanlıyım!' },
        { meetingId: 'seed-meeting-1', senderId: eng2.id, content: 'Ben de! Retinal görüntü veri setini inceleme fırsatım oldu, çok değerli bir çalışma.' },
        { meetingId: 'seed-meeting-1', senderId: doctor2.id, content: 'Toplantıdan önce metodoloji hakkında konuşabilir miyiz?' },
      ],
    });
  }

  const existingMsg2 = await prisma.message.findFirst({ where: { meetingId: 'seed-meeting-2' } });
  if (!existingMsg2) {
    await prisma.message.createMany({
      data: [
        { meetingId: 'seed-meeting-2', senderId: eng1.id, content: 'ECG veri setinizin formatı nedir, EDF mi yoksa CSV mi?' },
        { meetingId: 'seed-meeting-2', senderId: doctor1.id, content: 'HL7 aECG formatında, ancak CSV\'ye dönüştürebiliriz. 12 derivasyon, 500 Hz örnekleme.' },
        { meetingId: 'seed-meeting-2', senderId: eng1.id, content: 'Mükemmel. İlk model prototipini 2 haftada çıkarabilirim.' },
      ],
    });
  }

  console.log('✓ Meeting requests created (2)');
  console.log('✓ Seed messages created');
  console.log('\n✅ Seed complete!');
  console.log('  admin@metu.edu.tr        / Demo1234!  (ADMIN)');
  console.log('  doctor1@hacettepe.edu.tr / Demo1234!  (HEALTHCARE)');
  console.log('  doctor2@istanbul.edu.tr  / Demo1234!  (HEALTHCARE)');
  console.log('  eng1@metu.edu.tr         / Demo1234!  (ENGINEER)');
  console.log('  eng2@boun.edu.tr         / Demo1234!  (ENGINEER)');
}

main()
  .catch(err => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
