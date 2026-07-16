import { expect, Locator, test } from '@playwright/test';

async function getTranslate(locator: Locator) {
  const transform = await locator.getAttribute('transform');
  expect(transform).toBeTruthy();

  const match = transform?.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
  expect(match).toBeTruthy();

  return {
    x: Number(match?.[1]),
    y: Number(match?.[2]),
  };
}

test('can add, drag, and connect nodes', async ({ page }) => {
  await page.goto('/');

  const canvas = page.getByTestId('svg-canvas');
  await canvas.click({ position: { x: 120, y: 120 } });
  await canvas.click({ position: { x: 320, y: 220 } });

  await expect(page.getByTestId('node-count')).toHaveText('2');

  const nodeV1 = page.getByTestId('node-V1');
  const nodeV2 = page.getByTestId('node-V2');

  const initialV1 = await getTranslate(nodeV1);
  const initialV2 = await getTranslate(nodeV2);

  expect(initialV1.x).toBeGreaterThanOrEqual(118);
  expect(initialV1.x).toBeLessThanOrEqual(124);
  expect(initialV1.y).toBeGreaterThanOrEqual(118);
  expect(initialV1.y).toBeLessThanOrEqual(124);

  expect(initialV2.x).toBeGreaterThanOrEqual(318);
  expect(initialV2.x).toBeLessThanOrEqual(324);
  expect(initialV2.y).toBeGreaterThanOrEqual(218);
  expect(initialV2.y).toBeLessThanOrEqual(224);

  const box = await nodeV1.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 80, box!.y + box!.height / 2 + 50);
  await page.mouse.up();

  await expect
    .poll(async () => getTranslate(nodeV1))
    .toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
    });

  const movedV1 = await getTranslate(nodeV1);
  expect(movedV1.x).toBeGreaterThan(initialV1.x + 40);
  expect(movedV1.y).toBeGreaterThan(initialV1.y + 20);

  await page.getByTestId('mode-add-edge').click();
  await expect(page.getByTestId('current-mode')).toHaveText('ADD_EDGE');

  await nodeV1.click();
  await expect(page.getByTestId('pending-edge-source')).not.toHaveText('無');

  await canvas.hover({ position: { x: initialV2.x, y: initialV2.y } });
  await expect(page.getByTestId('preview-edge')).toBeVisible();

  await nodeV2.click();

  await expect(page.getByTestId('edge-count')).toHaveText('1');
  await expect(page.getByTestId('pending-edge-source')).toHaveText('無');
  await expect(page.getByTestId('edge-edge_1')).toBeVisible();
});
