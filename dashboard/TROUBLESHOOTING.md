# Dashboard Troubleshooting Guide

## Common Issues & Solutions

### 1. `<nextjs-portal>` Error / Hydration Mismatch

**Symptom**: You see `<nextjs-portal>` elements in the DOM or errors about hydration mismatches.

**Cause**: Server-rendered HTML doesn't match client-rendered output, often due to:
- Random data generation on both server and client
- Browser-specific APIs used during SSR
- Chart libraries rendering differently on server vs client

**Solution Applied**: ✅ **FIXED**
- Added `isClient` state check in chart components
- Charts only render after client-side hydration
- Shows loading state during hydration

### 2. TypeScript Errors in Charts

**Symptom**: `Property 'toFixed' does not exist on type 'ValueType'`

**Solution Applied**: ✅ **FIXED**
- Added type checking: `typeof value === 'number'`
- Safe type conversion before calling `.toFixed()`

### 3. Build Errors

**Issue**: `npm run build` fails

**Solutions**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### 4. Port Already in Use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
npm run dev -- -p 3001
```

### 5. Module Not Found Errors

**Issue**: `Cannot find module '@/components/...'`

**Solution**:
- Check `tsconfig.json` has correct path aliases
- Restart TypeScript server in VSCode: `Cmd+Shift+P` → "Restart TS Server"
- Clear cache: `rm -rf .next`

### 6. Data Not Loading

**Issue**: Dashboard shows "No examples found" or empty charts

**Solution**:
- Dashboard generates sample data automatically for demo
- To use real data:
  1. Run `python convert_data.py` from project root
  2. Place `wer_data.json` in `dashboard/public/data/`
  3. Update `dataProcessor.ts` to load from file

### 7. Deployment Errors on Vercel

**Issue**: Build succeeds locally but fails on Vercel

**Solutions**:
- Set root directory to `dashboard` in Vercel settings
- Check Node.js version: Vercel uses Node 18+ by default
- Verify `next.config.js` has `output: 'export'`
- Check environment variables if using API

### 8. Styling Issues / TailwindCSS Not Working

**Issue**: Styles not applied or CSS not updating

**Solution**:
```bash
# Restart dev server
# TailwindCSS watches file changes automatically
npm run dev
```

If still not working:
- Check `tailwind.config.ts` content paths
- Verify `globals.css` imports Tailwind directives
- Clear Next.js cache: `rm -rf .next`

### 9. Chart Performance Issues

**Issue**: Dashboard is slow with large datasets

**Solution**:
- Sample data: Already limited to 500 points
- For production data:
  - Reduce data points displayed
  - Implement pagination
  - Use data aggregation
  - Add virtualization for large lists

### 10. Mobile Responsiveness Issues

**Issue**: Dashboard doesn't look good on mobile

**Solution**: ✅ Already responsive with Tailwind breakpoints:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up

Test with Chrome DevTools mobile view.

---

## Quick Fixes Checklist

When you encounter any error:

1. **Clear cache**:
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   ```

2. **Restart dev server**:
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

3. **Check console**:
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Verify file structure**:
   ```
   dashboard/
   ├── src/
   │   ├── app/
   │   ├── components/
   │   └── utils/
   ├── public/
   ├── package.json
   └── next.config.js
   ```

5. **Check dependencies**:
   ```bash
   npm list react react-dom next
   # Should show compatible versions
   ```

---

## Getting Help

### Debug Mode

Enable verbose logging in Next.js:

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Then open Chrome DevTools for Node.js debugging.

### Check Next.js Logs

Logs are in `.next/` folder:
- Build logs: `.next/build-manifest.json`
- Error logs: `.next/trace`

### Common Command Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Debugging
npm run dev -- --inspect     # Debug mode
npm run build -- --debug     # Verbose build
```

---

## Still Having Issues?

1. **Check Next.js Docs**: https://nextjs.org/docs
2. **Recharts Docs**: https://recharts.org/
3. **TailwindCSS Docs**: https://tailwindcss.com/docs

Or refer to:
- `README.md` for setup instructions
- `DEPLOYMENT_GUIDE.md` for deployment help
- `COMPLETE_DOCUMENTATION.md` for technical details

---

**Last Updated**: December 2024

