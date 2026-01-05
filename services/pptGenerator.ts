import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { GeneratedPlan, UserProfile } from '../types';
import { BRAND_COLOR_PRIMARY, BRAND_COLOR_SECONDARY, PRODUCTS } from '../constants';

// Clean standard initialization for Bundler environment
export const generatePPT = async (user: UserProfile, plan: GeneratedPlan) => {
  let pptx = new PptxGenJS();

  // --- 2. Data Sanitization Helpers ---
  const safeText = (text: any, fallback = "-") => {
    if (text === null || text === undefined) return fallback;
    return String(text);
  };

  const safeArray = (arr: any) => {
    if (Array.isArray(arr)) return arr;
    return [];
  };

  // Set Metadata
  pptx.author = '好保研 Unipath';
  pptx.company = 'Unipath';
  pptx.revision = '1';
  pptx.subject = '保研规划报告';
  pptx.title = `${safeText(user.name)} - 保研规划书`;
  pptx.layout = 'LAYOUT_16x9';

  // --- Theme Colors ---
  const primaryColor = BRAND_COLOR_PRIMARY.replace('#', '');
  const secondaryColor = BRAND_COLOR_SECONDARY.replace('#', '');
  const white = "FFFFFF";
  const darkText = "333333";

  // --- Helper: Add Header ---
  const addHeader = (slide: PptxGenJS.Slide, title: string) => {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: primaryColor });
    slide.addText('好保研 UNIPATH', { x: 0.3, y: 0.15, fontSize: 18, color: white, bold: true, fontFace: 'Microsoft YaHei' });
    slide.addText('好/保/研，保/好/研', { x: 11, y: 0.25, fontSize: 12, color: white, align: 'right', fontFace: 'Microsoft YaHei' });
    slide.addText(safeText(title), { x: 0.5, y: 1.0, fontSize: 24, color: primaryColor, bold: true, fontFace: 'Microsoft YaHei' });
    slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.5, w: '90%', h: 0, line: { color: secondaryColor, width: 2 } });
  };

  // --- Helper: Add Footer ---
  const addFooter = (slide: PptxGenJS.Slide) => {
    slide.addText('Sources: Official University Admissions / Unipath Database', { x: 0.5, y: 7.0, fontSize: 8, color: '888888', fontFace: 'Arial' });
    slide.addSlideNumber({ x: '95%', y: '92%', fontSize: 10, color: '888888' });
  };

  // --- Slide 1: Cover ---
  const slide1 = pptx.addSlide();
  slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { type: 'solid', color: primaryColor } });
  
  const productInfo = plan.productRecommendation === 'Sunrise' ? PRODUCTS.SUNRISE : PRODUCTS.HARVEST;
  
  slide1.addText(safeText(productInfo.name), { x: 1, y: 2.5, fontSize: 44, color: white, bold: true, fontFace: 'Microsoft YaHei' });
  slide1.addText('专属保研规划报告', { x: 1, y: 3.5, fontSize: 24, color: white, fontFace: 'Microsoft YaHei' });
  slide1.addText(`学生：${safeText(user.name)} | 学校：${safeText(user.university)}`, { x: 1, y: 4.5, fontSize: 18, color: 'EEEEEE', fontFace: 'Microsoft YaHei' });
  slide1.addText('Unipath / 好保研', { x: 1, y: 6.5, fontSize: 14, color: white, bold: true });

  // --- Slide 2: Analysis & Summary ---
  const slide2 = pptx.addSlide();
  addHeader(slide2, plan.analysis?.title || '背景深度诊断');
  
  slide2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.8, w: 12.3, h: 1.2, fill: 'F3F3F3' });
  slide2.addText('核心综述', { x: 0.7, y: 2.0, fontSize: 14, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  slide2.addText(safeText(plan.summary, "暂无综述"), { x: 0.7, y: 2.4, w: 11.8, fontSize: 12, color: darkText, fontFace: 'Microsoft YaHei' });

  safeArray(plan.analysis?.content).forEach((point: string, index: number) => {
    slide2.addText(`• ${safeText(point)}`, { x: 0.7, y: 3.5 + (index * 0.5), w: 12, fontSize: 14, color: darkText, fontFace: 'Microsoft YaHei' });
  });
  addFooter(slide2);

  // --- Slide 3: SWOT Analysis ---
  const slideSwot = pptx.addSlide();
  addHeader(slideSwot, "SWOT 分析模型");

  const safeSwot = plan.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const swotBoxes = [
    { title: "S - 优势 (Strengths)", data: safeArray(safeSwot.strengths), x: 0.5, y: 1.8, color: "E6F4EA", headerColor: "34A853" },
    { title: "W - 劣势 (Weaknesses)", data: safeArray(safeSwot.weaknesses), x: 6.8, y: 1.8, color: "FCE8E6", headerColor: "EA4335" },
    { title: "O - 机会 (Opportunities)", data: safeArray(safeSwot.opportunities), x: 0.5, y: 4.4, color: "E8F0FE", headerColor: "4285F4" },
    { title: "T - 威胁 (Threats)", data: safeArray(safeSwot.threats), x: 6.8, y: 4.4, color: "FEF7E0", headerColor: "FBBC05" }
  ];

  swotBoxes.forEach(box => {
    slideSwot.addShape(pptx.ShapeType.rect, { x: box.x, y: box.y, w: 6.0, h: 2.4, fill: box.color });
    slideSwot.addText(box.title, { x: box.x + 0.2, y: box.y + 0.3, fontSize: 14, bold: true, color: box.headerColor, fontFace: 'Microsoft YaHei' });
    if (box.data.length > 0) {
        box.data.slice(0, 3).forEach((item: string, i: number) => {
            slideSwot.addText(`• ${safeText(item)}`, { x: box.x + 0.2, y: box.y + 0.8 + (i * 0.4), w: 5.6, fontSize: 11, color: darkText, fontFace: 'Microsoft YaHei' });
        });
    } else {
        slideSwot.addText("• 暂无数据", { x: box.x + 0.2, y: box.y + 0.8, fontSize: 11, color: "999999", fontFace: 'Microsoft YaHei' });
    }
  });
  addFooter(slideSwot);

  // --- Slide 4: Target Schools ---
  const slide3 = pptx.addSlide();
  addHeader(slide3, plan.targetSchools?.title || '目标院校定位');
  
  const schools = safeArray(plan.targetSchools?.content);
  const halfPoints = Math.ceil(schools.length / 2);
  const leftCol = schools.slice(0, halfPoints);
  const rightCol = schools.slice(halfPoints);

  leftCol.forEach((item: string, i: number) => {
     slide3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.3 + (i * 1.5), w: 5.8, h: 1.3, fill: 'FAFAFA', line: {color: 'CCCCCC'} });
     slide3.addText(safeText(item), { x: 0.6, y: 2.4 + (i * 1.5), w: 5.6, h: 1.1, fontSize: 12, color: darkText, valign: 'top', fontFace: 'Microsoft YaHei' });
  });

  rightCol.forEach((item: string, i: number) => {
    slide3.addShape(pptx.ShapeType.rect, { x: 6.8, y: 2.3 + (i * 1.5), w: 6.0, h: 1.3, fill: 'FAFAFA', line: {color: 'CCCCCC'} });
    slide3.addText(safeText(item), { x: 6.9, y: 2.4 + (i * 1.5), w: 5.8, h: 1.1, fontSize: 12, color: darkText, valign: 'top', fontFace: 'Microsoft YaHei' });
 });
  addFooter(slide3);

  // --- Slide 5: Timeline & Strategy ---
  const slide4 = pptx.addSlide();
  addHeader(slide4, '规划路线图 & 核心策略');

  slide4.addText('关键时间节点', { x: 0.5, y: 1.8, fontSize: 14, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  safeArray(plan.timeline?.content).forEach((t: string, i: number) => {
     slide4.addShape(pptx.ShapeType.rightArrow, { x: 0.5 + (i * 3.5), y: 2.2, w: 3, h: 0.8, fill: secondaryColor });
     slide4.addText(safeText(t), { x: 0.6 + (i * 3.5), y: 2.2, w: 2.8, h: 0.8, fontSize: 10, align: 'center', color: white, fontFace: 'Microsoft YaHei' });
  });

  slide4.addText(plan.competitionStrategy?.title || '竞赛规划', { x: 0.5, y: 3.5, fontSize: 14, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  safeArray(plan.competitionStrategy?.content).slice(0, 3).forEach((c: string, i: number) => {
    slide4.addText(`• ${safeText(c)}`, { x: 0.5, y: 3.9 + (i * 0.4), w: 6, fontSize: 11, color: darkText, fontFace: 'Microsoft YaHei' });
  });

  slide4.addText(plan.researchStrategy?.title || '科研规划', { x: 7.0, y: 3.5, fontSize: 14, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  safeArray(plan.researchStrategy?.content).slice(0, 3).forEach((r: string, i: number) => {
    slide4.addText(`• ${safeText(r)}`, { x: 7.0, y: 3.9 + (i * 0.4), w: 6, fontSize: 11, color: darkText, fontFace: 'Microsoft YaHei' });
  });
  addFooter(slide4);

  // --- Slide 6: Employment ---
  const slide5 = pptx.addSlide();
  addHeader(slide5, '就业展望 & Unipath 解决方案');
  const safeEmployment = plan.employment || { title: "未来就业与薪资展望", averageSalary: "需重新生成规划以获取数据", topCompanies: ["-"], roles: ["-"] };

  slide5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.8, w: 12.3, h: 1.5, fill: 'F3E5F5' });
  slide5.addText(safeText(safeEmployment.title), { x: 0.7, y: 2.1, fontSize: 14, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  slide5.addText(`预估年薪：${safeText(safeEmployment.averageSalary)}`, { x: 0.7, y: 2.5, fontSize: 12, bold: true, color: darkText, fontFace: 'Microsoft YaHei' });
  slide5.addText(`重点去向：${safeArray(safeEmployment.topCompanies).join(', ')}`, { x: 0.7, y: 2.9, fontSize: 11, color: darkText, fontFace: 'Microsoft YaHei' });

  slide5.addText(`推荐产品：${safeText(productInfo.name)}`, { x: 0.5, y: 4.0, fontSize: 20, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  slide5.addText(safeText(productInfo.description), { x: 0.5, y: 4.8, w: 8, fontSize: 14, color: darkText, fontFace: 'Microsoft YaHei' });

  slide5.addShape(pptx.ShapeType.roundRect, { x: 9, y: 4.5, w: 3.5, h: 2, fill: primaryColor });
  slide5.addText("立即咨询\n开启保研之路", { x: 9, y: 4.5, w: 3.5, h: 2, align: 'center', color: white, fontSize: 18, fontFace: 'Microsoft YaHei' });
  addFooter(slide5);

  // Save
  try {
    await pptx.writeFile({ fileName: `好保研规划_${safeText(user.name)}.pptx` });
  } catch (err: any) {
    console.error("WriteFile Error", err);
    throw new Error(`文件保存失败: ${err.message}`);
  }
};