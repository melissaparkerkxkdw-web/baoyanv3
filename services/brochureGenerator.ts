import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { PRODUCTS } from '../constants';

// Ensure JSZip is attached globally for PptxGenJS
if (typeof window !== 'undefined' && !(window as any).JSZip) {
  (window as any).JSZip = JSZip;
}

export const generateBrochure = async (productKey: 'SUNRISE' | 'HARVEST') => {
  const product = PRODUCTS[productKey];
  
  // Initialize PPTX
  let pptx: PptxGenJS;
  try {
    pptx = new PptxGenJS();
  } catch (e) {
    // @ts-ignore
    pptx = new (PptxGenJS.default)();
  }

  // Define Layout
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '好保研 Unipath';
  pptx.title = `${product.name} - 产品手册`;

  // Colors
  const primaryColor = productKey === 'SUNRISE' ? "2563EB" : "9333EA"; // Blue or Purple
  const white = "FFFFFF";
  const darkText = "333333";
  const lightBg = "F3F4F6";

  // --- Slide 1: Cover ---
  const slide1 = pptx.addSlide();
  
  // Background Shape
  slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: primaryColor });
  
  // Title
  slide1.addText(product.name, { 
    x: 0.5, y: 2.5, w: '90%', fontSize: 40, color: white, bold: true, align: 'center', fontFace: 'Microsoft YaHei' 
  });
  
  // Tagline
  slide1.addText(product.tagline, { 
    x: 0.5, y: 3.5, w: '90%', fontSize: 24, color: 'EEEEEE', align: 'center', fontFace: 'Microsoft YaHei' 
  });

  // Footer Logo text
  slide1.addText('Unipath / 好保研', { 
    x: 0.5, y: 6.5, w: '90%', fontSize: 16, color: white, align: 'center', fontFace: 'Microsoft YaHei' 
  });

  // --- Slide 2: Details ---
  const slide2 = pptx.addSlide();
  
  // Header Strip
  slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: primaryColor });
  slide2.addText(product.name + " - 核心权益", { x: 0.5, y: 0.25, fontSize: 24, color: white, bold: true, fontFace: 'Microsoft YaHei' });

  // Description Box
  slide2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 12.3, h: 2.0, fill: lightBg });
  slide2.addText('项目介绍', { x: 0.7, y: 1.7, fontSize: 14, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });
  slide2.addText(product.description, { x: 0.7, y: 2.1, w: 11.8, fontSize: 14, color: darkText, fontFace: 'Microsoft YaHei' });

  // Features List
  slide2.addText('核心服务内容', { x: 0.5, y: 4.0, fontSize: 16, bold: true, color: primaryColor, fontFace: 'Microsoft YaHei' });

  const features = productKey === 'SUNRISE' 
    ? [
        "• 顶会/顶刊护航：CCF-A/B类会议及SCI期刊全流程指导",
        "• 金牌竞赛辅导：ACM/ICPC/挑战杯金牌导师带队",
        "• 强基夏令营：清华/北大/中科院等名校入营深度辅导",
        "• 博士团定制：CS/AI方向博士团队1v1个性化定制"
      ]
    : [
        "• 全学科覆盖：文理工商医全学科10000+导师数据库匹配",
        "• 文书深度润色：PS/CV/推荐信5轮+精细化打磨",
        "• 实战模拟面试：单面/群面/压力面全真模拟",
        "• 个性化方案：跨专业/双非逆袭等特殊背景定制"
      ];

  features.forEach((feature, i) => {
    slide2.addText(feature, { 
      x: 0.5, y: 4.5 + (i * 0.6), w: 12, fontSize: 14, color: darkText, fontFace: 'Microsoft YaHei' 
    });
  });

  // Footer
  slide2.addText('咨询微信：Unipath_Emily | 官网：www.unipath.cn', {
    x: 0, y: 7.0, w: '100%', fontSize: 10, color: '888888', align: 'center', fontFace: 'Arial'
  });

  // Save file
  try {
    await pptx.writeFile({ fileName: `好保研_${productKey === 'SUNRISE' ? '破晓' : '桃李'}计划手册.pptx` });
  } catch (err: any) {
    console.error("Manual PPT Generation Error", err);
    alert("手册下载失败，请重试");
  }
};
