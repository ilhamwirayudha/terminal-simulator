import * as THREE from 'three';
import { CUKER_BOUNDS, SOUTHWEST_BARRIER_CONFIG } from './GeoCuker.js';
import {
  curbHazardWhiteMat,
  curbHazardBlackMat
} from '../../../assets/materials/roadMaterials.js';

/**
 * ==============================================================================
 * Sub-Area: Perkerasan Lahan & Tanggul Pesisir Cuker / Blok TR 5
 * ==============================================================================
 * - Base perkerasan aspal heavy-duty pelabuhan (Y = 1.565m)
 * - Batas awal Z = 1034.4m (Zero-Clipping dengan cyWaitingArea)
 * - Batas akhir timur laut DIMUNDURKAN KE Z = 1145.0m sesuai permintaan pengguna
 * - Bukaan gerbang kanstin di Z in [1050.0, 1074.0m] (lebar 24m)
 * - Tanggul tanah reklamasi cokelat / kerikil bentuk L di sisi NW & NE (Z: 1145 - 1159m)
 */
export function createSubAreaPerkerasanCuker() {
  const pavementGroup = new THREE.Group();
  pavementGroup.name = 'subarea_cuker_pavement';

  const yBase = 1.565;
  const zEndAsphalt = CUKER_BOUNDS.zAsphaltMax; // 1145.0m
  const zEndSoil = CUKER_BOUNDS.zBufferMax;     // 1159.0m

  // Material Aspal Industri Gelap (Port Heavy-Duty Asphalt)
  const cyPavementMat = new THREE.MeshStandardMaterial({
    color: 0x272c32,
    roughness: 0.90,
    metalness: 0.08
  });

  // Material Tanggul Tanah Urukan Reklamasi Cokelat
  const reclamationSoilMat = new THREE.MeshStandardMaterial({
    color: 0x7c5838,
    roughness: 0.96,
    metalness: 0.04
  });

  // ----------------------------------------------------------------------------
  // 1. Base Perkerasan Aspal Utama Lapangan Cuker & TR 5
  // Poligon dari Z: 1034.4 s/d 1145.0 dan X: 16.9 s/d 136.0
  // ----------------------------------------------------------------------------
  const shape = new THREE.Shape();
  // Sudut Barat Daya di batas akhir cyWaitingArea (X = 16.9, Z = 1034.4)
  shape.moveTo(16.9, -1034.4);
  // Menyusuri kanstin tertutup pelindung gedung ke Z = 1050.0 (X = 16.9)
  shape.lineTo(16.9, -1050.0);
  // Menyusuri bukaan gerbang Cuker ke Z = 1074.0 (X = 16.9)
  shape.lineTo(16.9, -1074.0);
  // Masuk sedikit ke kanstin dalam pemisah Jl. Tlk. Lamong (X = 18.5)
  shape.lineTo(18.5, -1074.0);
  // Menyusuri kanstin tenggara sejajar Jl. Tlk. Lamong ke Z = 1145.0 (X = 18.5)
  shape.lineTo(18.5, -zEndAsphalt);
  // Membelok ke Timur Laut menyusuri batas akhir aspal ke arah Barat Laut (X = 136.0, Z = 1145.0)
  shape.lineTo(136.0, -zEndAsphalt);
  // Menyusuri batas belakang sisi Barat Laut kembali ke Z = 1034.4 (X = 136.0)
  shape.lineTo(136.0, -1034.4);
  // Menutup kembali ke titik awal di batas barat daya (X = 16.9, Z = 1034.4)
  shape.closePath();

  const mainPavementGeo = new THREE.ShapeGeometry(shape);
  const mainPavementMesh = new THREE.Mesh(mainPavementGeo, cyPavementMat);
  mainPavementMesh.rotation.x = -Math.PI / 2;
  mainPavementMesh.position.set(0, yBase, 0);
  mainPavementMesh.receiveShadow = true;
  pavementGroup.add(mainPavementMesh);

  // ----------------------------------------------------------------------------
  // 2. Tanggul Tanah Reklamasi Bentuk L (Membungkus Sisi NW & NE)
  // Sisi NW (X: 136.0 s/d 148.0) dan Sisi NE (Z: 1145.0 s/d 1159.0)
  // ----------------------------------------------------------------------------
  const soilShape = new THREE.Shape();
  soilShape.moveTo(136.0, -1034.4);
  soilShape.lineTo(148.0, -1034.4);
  soilShape.lineTo(148.0, -zEndSoil);
  soilShape.lineTo(18.5, -zEndSoil);
  soilShape.lineTo(18.5, -zEndAsphalt);
  soilShape.lineTo(136.0, -zEndAsphalt);
  soilShape.lineTo(136.0, -1034.4);
  soilShape.closePath();

  const soilGeo = new THREE.ShapeGeometry(soilShape);
  const soilMesh = new THREE.Mesh(soilGeo, reclamationSoilMat);
  soilMesh.rotation.x = -Math.PI / 2;
  soilMesh.position.set(0, yBase - 0.005, 0);
  soilMesh.receiveShadow = true;
  pavementGroup.add(soilMesh);

  // ----------------------------------------------------------------------------
  // 3. Kanstin Hazard Pembatas Lapangan & Jalan
  // ----------------------------------------------------------------------------
  // A. Kanstin Tepi Barat Laut (X = 136.0, Z: 1034.4 s/d 1145.0)
  const nwLen = zEndAsphalt - 1034.4;
  const nwMidZ = (1034.4 + zEndAsphalt) / 2;
  const nwCurb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, nwLen), curbHazardWhiteMat);
  nwCurb.position.set(136.0, yBase + 0.11, nwMidZ);
  nwCurb.castShadow = true;
  pavementGroup.add(nwCurb);

  // B. Kanstin Tepi Timur Laut (Z = 1145.0, X: 18.5 s/d 136.0)
  const neWidth = 136.0 - 18.5;
  const neMidX = (18.5 + 136.0) / 2;
  const neCurb = new THREE.Mesh(new THREE.BoxGeometry(neWidth, 0.22, 0.35), curbHazardWhiteMat);
  neCurb.position.set(neMidX, yBase + 0.11, zEndAsphalt);
  neCurb.castShadow = true;
  pavementGroup.add(neCurb);

  return pavementGroup;
}
